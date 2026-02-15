const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // FIXED: Load env FIRST
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();

// FIXED: Initialize SendGrid AFTER dotenv
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized with API key');
} else {
  console.log('⚠️  WARNING: SENDGRID_API_KEY not found in .env');
}

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:19000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Database Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hospital',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) return console.error('Error acquiring client', err.stack);
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) return console.error('Error executing query', err.stack);
    console.log('✅ Connected to PostgreSQL (hospital db) successfully');
  });
});

// =================================================================================
//  AUDIT LOGGING HELPER FUNCTION (NEW)
// =================================================================================
const logAccess = async ({ req, accountId, accountType, username, role, action, status }) => {
  try {
    // 1. Capture IP Address
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (ip === '::1') ip = '127.0.0.1'; // Clean up localhost IPv6

    // 2. Prepare Account Type (Ensure we use 'USER' instead of 'PATIENT')
    let typeStr = accountType ? accountType.toUpperCase() : 'UNKNOWN';
    if (typeStr === 'PATIENT') typeStr = 'USER'; // Override per request

    // 3. Insert into access_logs
    const query = `
      INSERT INTO access_logs 
      (account_id, account_type, username, role, action, status, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await pool.query(query, [
      accountId || null, 
      typeStr,
      username || 'Unknown',
      role || 'Unknown',
      action,
      status,
      ip
    ]);

    console.log(`📝 Audit Log: [${status}] ${action} for ${username} (${typeStr})`);
  } catch (err) {
    console.error("❌ Audit Log Error:", err.message);
  }
};



// =================================================================================
//  AUDIT LOGS ROUTE (Add this to server.js)
// =================================================================================
app.get('/access_logs', async (req, res) => {
  try {
    // Select logs and order by newest first
    const result = await pool.query('SELECT * FROM access_logs ORDER BY login_time DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching logs:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// =================================================================================
//  ADD MISSING COLUMNS ROUTES
// =================================================================================

// Add this route to create the missing reset columns
app.post('/create-reset-columns', async (req, res) => {
  console.log("🛠️ Creating missing reset columns...");
  
  try {
    // 1. For accounts table (employees)
    console.log("🔧 Checking/creating columns in 'accounts' table...");
    
    // Check if reset_otp column exists
    const checkAccounts = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'accounts' 
        AND column_name = 'reset_otp'
    `);
    
    if (checkAccounts.rows.length === 0) {
      // Add columns to accounts table
      await pool.query(`
        ALTER TABLE accounts 
        ADD COLUMN reset_otp VARCHAR(10),
        ADD COLUMN reset_otp_expiry TIMESTAMP,
        ADD COLUMN reset_requested_at TIMESTAMP
      `);
      console.log("✅ Added reset columns to 'accounts' table");
    } else {
      console.log("✅ Reset columns already exist in 'accounts' table");
    }
    
    // 2. For patient_account table (patients)
    console.log("🔧 Checking/creating columns in 'patient_account' table...");
    
    const checkPatients = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patient_account' 
        AND column_name = 'reset_otp'
    `);
    
    if (checkPatients.rows.length === 0) {
      // Add columns to patient_account table
      await pool.query(`
        ALTER TABLE patient_account 
        ADD COLUMN reset_otp VARCHAR(10),
        ADD COLUMN reset_otp_expiry TIMESTAMP,
        ADD COLUMN reset_requested_at TIMESTAMP
      `);
      console.log("✅ Added reset columns to 'patient_account' table");
    } else {
      console.log("✅ Reset columns already exist in 'patient_account' table");
    }
    
    res.json({ 
      message: 'Reset columns created/verified successfully',
      accounts_updated: checkAccounts.rows.length === 0,
      patient_account_updated: checkPatients.rows.length === 0
    });
    
  } catch (err) {
    console.error("❌ Create reset columns error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add this route to check column status
app.get('/check-columns-status', async (req, res) => {
  console.log("🔍 Checking column status...");
  
  try {
    // Check accounts table
    const accountsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'accounts' 
        AND column_name IN ('reset_otp', 'reset_otp_expiry', 'reset_requested_at')
      ORDER BY column_name
    `);
    
    // Check patient_account table
    const patientColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'patient_account' 
        AND column_name IN ('reset_otp', 'reset_otp_expiry', 'reset_requested_at')
      ORDER BY column_name
    `);
    
    res.json({
      accounts: {
        has_columns: accountsColumns.rows.length > 0,
        columns: accountsColumns.rows,
        missing_count: 3 - accountsColumns.rows.length
      },
      patient_account: {
        has_columns: patientColumns.rows.length > 0,
        columns: patientColumns.rows,
        missing_count: 3 - patientColumns.rows.length
      }
    });
    
  } catch (err) {
    console.error("❌ Check columns status error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Email function for password reset
async function sendPasswordResetEmail(email, otp, userType, username) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  SendGrid not configured, skipping email send');
    return false;
  }

  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@furtopia.com',
      subject: 'Password Reset OTP - Furtopia Veterinary',
      text: `Your password reset OTP code is: ${otp}`,
      html: `<p>Your password reset OTP code is: <strong>${otp}</strong></p>`
    };

    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.response?.body || error.message);
    return false;
  }
}

// Email function for sending employee credentials
async function sendEmployeeCredentialsEmail(email, username, password, fullname, role) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  SendGrid not configured, skipping email send');
    return false;
  }

  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@furtopia.com',
      subject: 'Your Employee Account Credentials - Furtopia Veterinary',
      text: `Username: ${username}, Password: ${password}`,
      html: `<p>Username: <strong>${username}</strong><br>Password: <strong>${password}</strong></p>`
    };

    await sgMail.send(msg);
    console.log(`✅ Employee credentials email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send credentials email:', error.response?.body || error.message);
    return false;
  }
}

// =================================================================================
//  EMPLOYEE ROUTES
// =================================================================================

// =================================================================================
//  EMPLOYEE REGISTRATION - SINGLE, FIXED ENDPOINT (WITH AUDIT)
// =================================================================================
app.post('/register', async (req, res) => {
  console.log("📥 Employee registration request received");
  const { fullname, contactnumber, email, role, department, employeeid, userimage, status, datecreated } = req.body;

  // Validation
  if (!fullname) return res.status(400).json({ error: 'Full name is required' });
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!contactnumber) return res.status(400).json({ error: 'Contact number is required' });
  if (!employeeid) return res.status(400).json({ error: 'Employee ID is required' });

  // Helper functions
  function generateRandomUsername(name) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const timestamp = Date.now().toString().slice(-6);
      return `user_${timestamp}`;
    }
    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return `${cleanName.substring(0, 10)}_${Math.floor(Math.random() * 1000)}`;
  }

  function generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    return password;
  }

  try {
    const password = generateRandomPassword();
    const username = generateRandomUsername(fullname);
    const hashedPassword = await bcrypt.hash(password, 10);
    const imageBuffer = userimage ? Buffer.from(userimage, 'base64') : null;
    const userStatus = status || 'Active';

    // Format date
    let formattedDate;
    if (datecreated && datecreated.includes('/')) {
      const [month, day, year] = datecreated.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    const query = `
      INSERT INTO accounts 
      (username, password, fullname, contactnumber, email, role, 
       department, employeeid, userimage, status, datecreated, is_initial_login) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE) 
      RETURNING *
    `;
    const values = [username, hashedPassword, fullname, contactnumber, email, role, department, employeeid, imageBuffer, userStatus, formattedDate];

    const newAccount = await pool.query(query, values);
    const createdUser = newAccount.rows[0];

    console.log(`✅ Employee registered: ${username}`);

    // AUDIT LOG: CREATE ACCOUNT
    await logAccess({
      req,
      accountId: createdUser.pk,
      accountType: 'EMPLOYEE',
      username: createdUser.username,
      role: createdUser.role,
      action: 'REGISTER',
      status: 'SUCCESS'
    });

    // Send Email
    if (process.env.SENDGRID_API_KEY) {
      await sendEmployeeCredentialsEmail(email, username, password, fullname, role);
    }

    res.status(201).json({ 
      message: 'Employee registered successfully', 
      user: { 
        pk: createdUser.pk, 
        username: username, 
        email: email, 
        fullname: fullname 
      } 
    });

  } catch (err) {
    console.error("❌ Employee registration error:", err.message);
    if (err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Username or Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ========== LOGIN ROUTE (EMPLOYEE) - WITH AUDIT ==========
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Employee login attempt for username: ${username}`);
  
  try {
    let result = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
    let user = result.rows.length > 0 ? result.rows[0] : null;

    if (!user) {
      result = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
      user = result.rows.length > 0 ? result.rows[0] : null;
    }

    if (!user) {
      await logAccess({ req, accountId: null, accountType: 'UNKNOWN', username, role: 'UNKNOWN', action: 'LOGIN', status: 'FAILED' });
      return res.status(401).json({ error: 'User not found' });
    }

    // Determine type for logging
    const userType = result.rows[0].employeeid ? 'EMPLOYEE' : 'USER'; // Check for employee-specific field

    if (user.status === 'Disabled' || user.status === 'Inactive') {
      await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
      return res.status(403).json({ error: 'Account is disabled.' });
    }

    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      passwordValid = (user.password === password);
    }

    if (passwordValid) {
      await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'SUCCESS' });
      
      const imgBuffer = user.userImage || user.userimage;
      let imageStr = null;
      if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.pk, 
          username: user.username, 
          fullname: user.fullName || user.fullname, 
          role: user.role,
          department: user.department, 
          userImage: imageStr,
          isInitialLogin: user.is_initial_login || false
        } 
      });
    } else {
      await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error("❌ Employee login error:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get All Employees
app.get('/accounts', async (req, res) => {
  try {
    const allAccounts = await pool.query('SELECT * FROM accounts ORDER BY pk ASC');
    const formattedAccounts = allAccounts.rows.map(account => {
      const imgBuffer = account.userimage;
      let imageStr = null;
      if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      return { ...account, userimage: imageStr };
    });
    res.json(formattedAccounts);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update Employee Account
app.put('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { username, fullname, contactnumber, email, role, department, employeeid, userimage, status } = req.body;

  try {
    let imageBuffer = null;
    if (userimage && userimage.startsWith('data:image')) {
      const base64Data = userimage.split(',')[1]; 
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (userimage) {
      imageBuffer = Buffer.from(userimage, 'base64');
    }

    let query, values;
    if (imageBuffer) {
      query = `UPDATE accounts SET username=$1, fullname=$2, contactnumber=$3, email=$4, role=$5, department=$6, employeeid=$7, status=$8, userimage=$9 WHERE pk=$10 RETURNING *`;
      values = [username, fullname, contactnumber, email, role, department, employeeid, status, imageBuffer, id];
    } else {
      query = `UPDATE accounts SET username=$1, fullname=$2, contactnumber=$3, email=$4, role=$5, department=$6, employeeid=$7, status=$8 WHERE pk=$9 RETURNING *`;
      values = [username, fullname, contactnumber, email, role, department, employeeid, status, id];
    }

    const updatedAccount = await pool.query(query, values);
    if (updatedAccount.rows.length === 0) return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Updated successfully", user: updatedAccount.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================================
//  USER / PATIENT ROUTES (Updated to use 'USER' in logs)
// =================================================================================

app.post('/patient-register', async (req, res) => {
  console.log("📥 Patient registration request received");
  const { fullname, username, password, contactnumber, email, userimage, status, datecreated } = req.body;
  
  if (!fullname || !username || !password || !email || !contactnumber) {
    return res.status(400).json({ error: "All fields are required." });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let imageBuffer = null;
    if (userimage && typeof userimage === 'string' && userimage.trim() !== '') {
      try { imageBuffer = Buffer.from(userimage, 'base64'); } catch (imgErr) { imageBuffer = null; }
    }
    
    // Check duplicates
    const usernameCheck = await pool.query('SELECT pk FROM patient_account WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) return res.status(400).json({ error: 'Username already taken.' });
    
    const emailCheck = await pool.query('SELECT pk FROM patient_account WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) return res.status(400).json({ error: 'Email already registered.' });
    
    let statusValue = status === 'Active' ? '1' : '0';
    
    const query = `
      INSERT INTO patient_account 
      (username, password, fullname, contactnumber, email, userimage, status, datecreated) 
      VALUES ($1, $2, $3, $4, $5, $6, $7::bit varying, $8) 
      RETURNING *
    `;
    const values = [username, hashedPassword, fullname, contactnumber.replace(/\D/g, ''), email, imageBuffer, statusValue, datecreated];
    
    const newPatient = await pool.query(query, values);
    const createdPatient = newPatient.rows[0];
    
    console.log(`✅ Patient registered: ${username}`);

    // AUDIT LOG: REGISTER (Use 'USER')
    await logAccess({
      req,
      accountId: createdPatient.pk,
      accountType: 'USER', // Changed from PATIENT to USER per request
      username: createdPatient.username,
      role: 'user',
      action: 'REGISTER',
      status: 'SUCCESS'
    });
    
    res.status(201).json({ 
      message: 'Patient registered successfully', 
      patient: { 
        pk: createdPatient.pk, 
        username: username, 
        email: email, 
        fullname: fullname,
        status: status 
      } 
    });
    
  } catch (err) {
    console.error("❌ Patient registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Patient Login - WITH AUDIT
app.post('/patient-login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Patient login attempt for username: ${username}`);
  
  try {
    const result = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      await logAccess({ req, accountId: null, accountType: 'UNKNOWN', username, role: 'UNKNOWN', action: 'LOGIN', status: 'FAILED' });
      return res.status(401).json({ error: 'Patient account not found' });
    }

    const patient = result.rows[0];
    
    if (patient.status === 'Disabled' || patient.status === 'Inactive') {
      await logAccess({ req, accountId: patient.pk, accountType: 'USER', username: patient.username, role: 'user', action: 'LOGIN', status: 'FAILED' });
      return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
    }

    const passwordValid = await bcrypt.compare(password, patient.password);

    if (passwordValid) {
      await logAccess({ req, accountId: patient.pk, accountType: 'USER', username: patient.username, role: 'user', action: 'LOGIN', status: 'SUCCESS' });
      
      const imgBuffer = patient.userimage;
      let imageStr = null;
      if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: patient.pk, 
          username: patient.username, 
          fullname: patient.fullname, 
          email: patient.email, 
          contactnumber: patient.contactnumber,
          userimage: imageStr,
          userType: 'patient'
        } 
      });
    } else {
      await logAccess({ req, accountId: patient.pk, accountType: 'USER', username: patient.username, role: 'user', action: 'LOGIN', status: 'FAILED' });
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error("❌ Patient login error:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get All Patients
app.get('/patients', async (req, res) => {
  try {
    const allPatients = await pool.query('SELECT * FROM patient_account ORDER BY pk ASC');
    const formattedPatients = allPatients.rows.map(patient => {
      const imgBuffer = patient.userimage;
      let imageStr = null;
      if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      return { ...patient, userimage: imageStr };
    });
    res.json(formattedPatients);
  } catch (err) {
    res.status(500).json({ error: 'Server Error fetching patients' });
  }
});

// Update Patient
app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { username, fullname, contactnumber, email, userimage, status } = req.body;

  try {
    let imageBuffer = null;
    if (userimage && typeof userimage === 'string') {
      const base64Data = userimage.includes(',') ? userimage.split(',')[1] : userimage;
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    let query, values;
    if (imageBuffer) {
      query = `UPDATE patient_account SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5, userimage=$6 WHERE pk=$7 RETURNING *`;
      values = [username, fullname, contactnumber, email, status, imageBuffer, id];
    } else {
      query = `UPDATE patient_account SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5 WHERE pk=$6 RETURNING *`;
      values = [username, fullname, contactnumber, email, status, id];
    }

    const updated = await pool.query(query, values);
    if (updated.rows.length === 0) return res.status(404).json({ error: "Patient not found" });

    res.json({ message: "Updated successfully", patient: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================================
//  FORGOT PASSWORD ROUTES (UPDATED)
// =================================================================================

// 1. Request Password Reset
app.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  try {
    let user = null;
    let tableName = '';
    let userType = '';
    
    const employeeResult = await pool.query('SELECT pk, username, fullname, email FROM accounts WHERE email = $1', [email]);
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
      userType = 'employee';
    } else {
      const patientResult = await pool.query('SELECT pk, username, fullname, email FROM patient_account WHERE email = $1', [email]);
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
        userType = 'patient';
      }
    }
    
    if (!user) return res.status(404).json({ error: 'Email not found in our system' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); 
    
    await pool.query(
      `UPDATE ${tableName} SET reset_otp = $1, reset_otp_expiry = $2, reset_requested_at = CURRENT_TIMESTAMP WHERE pk = $3`,
      [otp, expiryTime, user.pk]
    );
    
    let emailSent = false;
    if (process.env.SENDGRID_API_KEY) {
      emailSent = await sendPasswordResetEmail(email, otp, userType, user.username);
    }
    
    res.json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (check logs for OTP)',
      userId: user.pk,
      email: user.email,
      otp: otp 
    });
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// 2. Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  
  try {
    let user = null;
    let tableName = '';
    
    const employeeResult = await pool.query('SELECT pk, username, reset_otp, reset_otp_expiry FROM accounts WHERE email = $1', [email]);
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
    } else {
      const patientResult = await pool.query('SELECT pk, username, reset_otp, reset_otp_expiry FROM patient_account WHERE email = $1', [email]);
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
      }
    }
    
    if (!user) return res.status(404).json({ error: 'Email not found' });
    if (!user.reset_otp) return res.status(400).json({ error: 'No OTP requested for this email' });
    
    if (user.reset_otp_expiry < new Date()) {
      await pool.query(`UPDATE ${tableName} SET reset_otp = NULL, reset_otp_expiry = NULL WHERE pk = $1`, [user.pk]);
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    if (user.reset_otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    res.json({ message: 'OTP verified successfully', userId: user.pk, email: email });
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 3. Reset Password with OTP
app.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required' });
  if (newPassword.length < 8 || newPassword.length > 30) return res.status(400).json({ error: 'Password must be 8-30 characters' });
  
  try {
    let user = null;
    let tableName = '';
    
    const employeeResult = await pool.query('SELECT pk, reset_otp, reset_otp_expiry FROM accounts WHERE email = $1', [email]);
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
    } else {
      const patientResult = await pool.query('SELECT pk, reset_otp, reset_otp_expiry FROM patient_account WHERE email = $1', [email]);
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
      }
    }
    
    if (!user) return res.status(404).json({ error: 'Email not found' });
    if (!user.reset_otp || user.reset_otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (user.reset_otp_expiry < new Date()) return res.status(400).json({ error: 'OTP has expired' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      `UPDATE ${tableName} SET password = $1, reset_otp = NULL, reset_otp_expiry = NULL, reset_requested_at = NULL WHERE pk = $2`,
      [hashedPassword, user.pk]
    );
    
    res.json({ message: 'Password reset successfully', success: true });
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// =================================================================================
//  UNIFIED LOGIN ROUTE (WITH AUDIT) - FIXED
// =================================================================================
app.post('/unified-login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Unified login attempt for: ${username}`);
  
  try {
    let user = null;
    let userType = null;

    // Check accounts (EMPLOYEE)
    const employeeResult = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      userType = 'EMPLOYEE';
    } else {
      // Check patients (USER)
      const patientResult = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        userType = 'USER'; // Log as USER instead of PATIENT
      }
    }
    
    if (!user) {
      await logAccess({ req, accountId: null, accountType: 'UNKNOWN', username, role: 'UNKNOWN', action: 'LOGIN', status: 'FAILED' });
      return res.status(401).json({ error: 'Account not found' });
    }
    
    if (user.status === 'Disabled' || user.status === 'Inactive') {
      await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
      return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
    }
    
    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      passwordValid = (user.password === password);
    }
    
    if (passwordValid) {
      // SUCCESS LOG
      await logAccess({ 
        req, 
        accountId: user.pk, 
        accountType: userType, 
        username: user.username, 
        role: user.role || 'user', 
        action: 'LOGIN', 
        status: 'SUCCESS' 
      });

      const userResponse = {
        id: user.pk,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        userType: userType.toLowerCase() === 'user' ? 'patient' : 'employee', // Keep frontend response as 'patient' if needed
        status: user.status
      };
      
      const imgBuffer = user.userimage;
      if (imgBuffer) userResponse.userImage = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

      if (userType === 'EMPLOYEE') {
        userResponse.role = user.role;
        userResponse.isInitialLogin = user.is_initial_login || false;
      }
      
      res.json({ message: 'Login successful', user: userResponse });
    } else {
      // FAIL LOG
      await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
      res.status(401).json({ error: 'Invalid password' });
    }
    
  } catch (err) {
    console.error("❌ Unified login error:", err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// =================================================================================
//  LOGOUT ROUTE (NEW)
// =================================================================================
app.post('/logout', async (req, res) => {
  const { userId, userType, username, role } = req.body;
  
  if (userId) {
    await logAccess({
      req, 
      accountId: userId, 
      accountType: userType === 'patient' ? 'USER' : (userType || 'UNKNOWN'), 
      username: username || 'Unknown', 
      role: role || 'Unknown', 
      action: 'LOGOUT', 
      status: 'SUCCESS'
    });
  }

  res.json({ message: 'Logged out successfully' });
});

// =================================================================================
//  OTHER SHARED ROUTES
// =================================================================================

// Update Credentials (for employees)
app.put('/update-credentials', async (req, res) => {
  console.log("📝 Update credentials request received");
  const { userId, newUsername, newPassword } = req.body;

  try {
    const usernameCheck = await pool.query('SELECT pk FROM accounts WHERE username = $1 AND pk != $2', [newUsername, userId]);
    if (usernameCheck.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = `UPDATE accounts SET username = $1, password = $2, is_initial_login = FALSE WHERE pk = $3 RETURNING pk, username, fullname, role, is_initial_login`;

    const updatedUser = await pool.query(updateQuery, [newUsername, hashedPassword, userId]);
    if (updatedUser.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Credentials updated successfully', user: updatedUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Furtopia Unified API Server',
    endpoints: {
      employees: { login: 'POST /employee-login', register: 'POST /register' },
      patients: { login: 'POST /patient-login', register: 'POST /patient-register' },
      unified: { login: 'POST /unified-login' }
    }
  });
});

// =================================================================================
//  AVAILABILITY & APPOINTMENTS ROUTES (Existing)
// =================================================================================

app.post('/api/availability/day', async (req, res) => {
  const { vet_id, day_of_week, pk_id, is_available } = req.body;
  try {
    let actualDayOfWeek = day_of_week;
    if (pk_id && !day_of_week) {
      const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday', 7: 'sunday' };
      actualDayOfWeek = dayMap[pk_id];
      if (!actualDayOfWeek) return res.status(400).json({ error: 'Invalid PK ID' });
    }
    const result = await pool.query(
      `INSERT INTO vet_availability_settings (vet_id, setting_type, day_of_week, is_available) VALUES ($1, 'day_availability', $2, $3) ON CONFLICT (vet_id, setting_type, day_of_week) DO UPDATE SET is_available = EXCLUDED.is_available, updated_at = CURRENT_TIMESTAMP RETURNING *`,
      [vet_id, actualDayOfWeek, is_available]
    );
    res.json({ message: 'Day availability saved', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/availability/time-slots', async (req, res) => {
  const { vet_id, day_of_week, slots } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query(`DELETE FROM vet_availability_settings WHERE vet_id = $1 AND setting_type = 'time_slot' AND day_of_week = $2`, [vet_id, day_of_week]);
    for (const slot of slots) {
      await pool.query(`INSERT INTO vet_availability_settings (vet_id, setting_type, day_of_week, start_time, end_time, slot_capacity) VALUES ($1, 'time_slot', $2, $3, $4, $5)`, [vet_id, day_of_week, slot.startTime, slot.endTime, slot.capacity || 1]);
    }
    await pool.query('COMMIT');
    res.json({ message: 'Time slots saved successfully', count: slots.length });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/availability/special-dates', async (req, res) => {
  const { vet_id, event_name, event_date, is_holiday } = req.body;
  try {
    const checkResult = await pool.query(`SELECT id FROM vet_availability_settings WHERE vet_id = $1 AND setting_type = 'special_date' AND event_date = $2`, [vet_id, event_date]);
    if (checkResult.rows.length > 0) {
      const updateResult = await pool.query(`UPDATE vet_availability_settings SET event_name = $1, is_holiday = $2, updated_at = CURRENT_TIMESTAMP WHERE vet_id = $3 AND setting_type = 'special_date' AND event_date = $4 RETURNING *`, [event_name, is_holiday || false, vet_id, event_date]);
      res.json({ message: 'Special date updated', event: updateResult.rows[0] });
    } else {
      const insertResult = await pool.query(`INSERT INTO vet_availability_settings (vet_id, setting_type, event_name, event_date, is_holiday) VALUES ($1, 'special_date', $2, $3, $4) RETURNING *`, [vet_id, event_name, event_date, is_holiday || false]);
      res.json({ message: 'Special date saved', event: insertResult.rows[0] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/availability/:vetId', async (req, res) => {
  const { vetId } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM vet_availability_settings WHERE vet_id = $1 ORDER BY setting_type, day_of_week, start_time`, [vetId]);
    const organizedData = {
      day_availability: [{day_of_week: 'sunday', is_available: false}, {day_of_week: 'monday', is_available: false}, {day_of_week: 'tuesday', is_available: false}, {day_of_week: 'wednesday', is_available: false}, {day_of_week: 'thursday', is_available: false}, {day_of_week: 'friday', is_available: false}, {day_of_week: 'saturday', is_available: false}],
      time_slots: [],
      special_dates: []
    };
    result.rows.forEach(row => {
      if (row.setting_type === 'day_availability') {
        const dayIndex = organizedData.day_availability.findIndex(d => d.day_of_week === row.day_of_week);
        if (dayIndex !== -1) organizedData.day_availability[dayIndex].is_available = row.is_available;
      } else if (row.setting_type === 'time_slot') {
        organizedData.time_slots.push({ day_of_week: row.day_of_week, start_time: row.start_time, end_time: row.end_time, capacity: row.slot_capacity });
      } else if (row.setting_type === 'special_date') {
        organizedData.special_dates.push({ event_name: row.event_name, event_date: row.event_date, is_holiday: row.is_holiday });
      }
    });
    res.json(organizedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/availability/time-slots/:vetId/:day', async (req, res) => {
  const { vetId, day } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM vet_availability_settings WHERE vet_id = $1 AND setting_type = 'time_slot' AND day_of_week = $2 ORDER BY start_time`, [vetId, day]);
    res.json({ timeSlots: result.rows.map(row => ({ id: row.id, start_time: row.start_time, end_time: row.end_time, capacity: row.slot_capacity })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/availability/time-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  try {
    const result = await pool.query(`DELETE FROM vet_availability_settings WHERE id = $1 AND setting_type = 'time_slot' RETURNING *`, [slotId]);
    res.json({ message: 'Time slot deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { patientName, patientEmail, patientPhone, petName, petType, petGender, appointmentType, selectedDate, timeSlotId, timeSlotDisplay, doctorId = null } = req.body;
  try {
    await pool.query('BEGIN');
    const slotResult = await pool.query(`SELECT * FROM vet_availability_settings WHERE id = $1 AND setting_type = 'time_slot' FOR UPDATE`, [timeSlotId]);
    if (slotResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot not found' });
    }
    const slot = slotResult.rows[0];
    if ((slot.current_bookings || 0) >= (slot.slot_capacity || 1)) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot is fully booked' });
    }
    await pool.query(`UPDATE vet_availability_settings SET current_bookings = current_bookings + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [timeSlotId]);
    const appointmentQuery = `INSERT INTO appointments (patient_name, patient_email, patient_phone, pet_name, pet_type, pet_gender, appointment_type, appointment_date, time_slot_id, time_slot_display, doctor_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'scheduled') RETURNING *`;
    const newAppointment = await pool.query(appointmentQuery, [patientName, patientEmail, patientPhone, petName, petType, petGender, appointmentType, selectedDate, timeSlotId, timeSlotDisplay, doctorId]);
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment.rows[0] });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments/date/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const appointments = await pool.query(`SELECT * FROM appointments WHERE appointment_date = $1 ORDER BY time_slot_display`, [date]);
    res.json({ appointments: appointments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await pool.query(`SELECT a.*, v.day_of_week, v.start_time, v.end_time, v.slot_capacity FROM appointments a LEFT JOIN vet_availability_settings v ON a.time_slot_id = v.id ORDER BY a.appointment_date DESC, a.time_slot_display`);
    res.json({ appointments: appointments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments/table', async (req, res) => {
  try {
    const appointments = await pool.query(`SELECT a.id, a.patient_name as "name", a.appointment_type as "service", CONCAT(TO_CHAR(a.appointment_date, 'Mon DD, YYYY'), ' - ', a.time_slot_display) as "date_time", CASE WHEN a.doctor_id IS NOT NULL THEN ac."fullname" ELSE 'Not Assigned' END as "doctor", a.doctor_id as "assignedDoctor", a.status, a.patient_email, a.patient_phone, a.pet_name, a.pet_type, COALESCE(a.pet_gender, 'Unknown') as "petGender" FROM appointments a LEFT JOIN accounts ac ON a.doctor_id = ac.pk WHERE a.status != 'cancelled' OR a.status IS NULL ORDER BY a.appointment_date, a.time_slot_display`);
    res.json({ appointments: appointments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments/booked-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { date } = req.query;
  try {
    const result = await pool.query(`SELECT slot_capacity as capacity, current_bookings as booked_count FROM vet_availability_settings WHERE id = $1 AND setting_type = 'time_slot'`, [slotId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Time slot not found' });
    const slot = result.rows[0];
    res.json({ slotId, date, bookedCount: slot.booked_count || 0, capacity: slot.capacity || 1, availableSlots: (slot.capacity || 1) - (slot.booked_count || 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('BEGIN');
    const appointmentResult = await pool.query(`SELECT time_slot_id, status FROM appointments WHERE id = $1`, [id]);
    if (appointmentResult.rows.length === 0) { await pool.query('ROLLBACK'); return res.status(404).json({ error: 'Appointment not found' }); }
    const appointment = appointmentResult.rows[0];
    if (appointment.status === 'cancelled') { await pool.query('ROLLBACK'); return res.status(400).json({ error: 'Appointment is already cancelled' }); }
    if (appointment.time_slot_id) await pool.query(`UPDATE vet_availability_settings SET current_bookings = GREATEST(0, current_bookings - 1), updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [appointment.time_slot_id]);
    const updateResult = await pool.query(`UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [id]);
    await pool.query('COMMIT');
    res.json({ message: 'Appointment cancelled successfully', appointment: updateResult.rows[0] });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/availability/reset-bookings', async (req, res) => {
  try {
    const result = await pool.query(`UPDATE vet_availability_settings SET current_bookings = 0, updated_at = CURRENT_TIMESTAMP WHERE setting_type = 'time_slot' AND DATE(updated_at) < CURRENT_DATE`);
    res.json({ message: 'Bookings reset successfully', rowsUpdated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id/assign-doctor', async (req, res) => {
  const { id } = req.params;
  const { doctorId } = req.body;
  try {
    const appointmentCheck = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (appointmentCheck.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    const doctorResult = await pool.query('SELECT "fullname" FROM accounts WHERE pk = $1', [doctorId]);
    const doctorName = doctorResult.rows.length > 0 ? doctorResult.rows[0].fullname : 'Unknown Doctor';
    const updatedAppointment = await pool.query(`UPDATE appointments SET doctor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [doctorId, id]);
    res.json({ message: 'Doctor assigned successfully', appointment: updatedAppointment.rows[0], doctorName: doctorName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/availability/day-by-pk', async (req, res) => {
  const { vet_id, pk_id, is_available } = req.body;
  try {
    const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday', 7: 'sunday' };
    const day_of_week = dayMap[pk_id];
    if (!day_of_week) return res.status(400).json({ error: 'Invalid PK ID' });
    const result = await pool.query(`INSERT INTO vet_availability_settings (vet_id, setting_type, day_of_week, is_available) VALUES ($1, 'day_availability', $2, $3) ON CONFLICT (vet_id, setting_type, day_of_week) DO UPDATE SET is_available = EXCLUDED.is_available, updated_at = CURRENT_TIMESTAMP RETURNING *`, [vet_id, day_of_week, is_available]);
    res.json({ message: 'Day availability saved', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
});