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
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Database Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'veterinaryDB',
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
//  EMAIL VERIFICATION UTILITIES (ADD THIS)
// =================================================================================

// Generate a unique verification token
function generateVerificationToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Send verification email
async function sendVerificationEmail(email, fullname, token) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️ SendGrid not configured, skipping verification email');
    return false;
  }

  // Construct verification link
  const webAppUrl = 'http://localhost:8082'; // Web app port
  const verificationLink = `${webAppUrl}/verify-email?token=${token}`;
  
  console.log(`🔗 Verification link for WEB: ${verificationLink}`);

  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@furtopia.com',
      subject: 'Verify Your Email - Furtopia Veterinary',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #3d67ee;">Welcome to Furtopia!</h2>
          </div>
          
          <p style="font-size: 16px; color: #333;">Hello <strong>${fullname}</strong>,</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Thank you for registering with PetShield Veterinary. To complete your registration and access your account, 
            please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #3d67ee; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.5;">
            Or copy and paste this link into your browser:<br>
            <span style="color: #3d67ee;">${verificationLink}</span>
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            This verification link will expire in 24 hours.<br>
            If you didn't create an account with PetShield, please ignore this email.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The PetShield Team
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.response?.body || error.message);
    return false;
  }
}

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
    let result;
    let user = null;

    // Check patient_account first
    result = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      user = result.rows[0];
      console.log("✅ Found in patient_account");
      
      // Patient login logic
      if (user.status === 'Disabled' || user.status === 'Inactive' || user.status === '0') {
        return res.status(403).json({ error: 'Account is disabled.' });
      }

      let passwordValid = false;
      if (user.password && user.password.startsWith('$2')) {
        passwordValid = await bcrypt.compare(password, user.password);
      } else {
        passwordValid = (user.password === password);
      }

      if (passwordValid) {
        const imgBuffer = user.userimage;
        let imageStr = null;
        if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

        return res.json({ 
          message: 'Login successful', 
          user: { 
            id: user.pk, 
            username: user.username, 
            fullname: user.fullname, 
            role: 'User', // Give them a role
            userImage: imageStr,
            userType: 'patient'
          } 
        });
      } else {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }
    
    // Then check accounts (employees)
    result = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      user = result.rows[0];
      console.log("✅ Found in accounts");
      
      // Employee login logic...
      if (user.status === 'Disabled' || user.status === 'Inactive') {
        return res.status(403).json({ error: 'Account is disabled.' });
      }

      let passwordValid = false;
      if (user.password && user.password.startsWith('$2')) {
        passwordValid = await bcrypt.compare(password, user.password);
      } else {
        passwordValid = (user.password === password);
      }

      if (passwordValid) {
        const imgBuffer = user.userimage;
        let imageStr = null;
        if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

        return res.json({ 
          message: 'Login successful', 
          user: { 
            id: user.pk, 
            username: user.username, 
            fullname: user.fullname, 
            role: user.role,
            department: user.department,
            userImage: imageStr,
            isInitialLogin: user.is_initial_login || false,
            userType: 'employee'
          } 
        });
      } else {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    // If we get here, user not found
    return res.status(401).json({ error: 'User not found' });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// // ========== OLD LOGIN ROUTE (EMPLOYEE) - WITH AUDIT ==========
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   console.log(`🔐 Employee login attempt for username: ${username}`);
  
//   try {
//     let result = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
//     let user = result.rows.length > 0 ? result.rows[0] : null;

//     if (!user) {
//       result = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
//       user = result.rows.length > 0 ? result.rows[0] : null;
//     }

//     if (!user) {
//       await logAccess({ req, accountId: null, accountType: 'UNKNOWN', username, role: 'UNKNOWN', action: 'LOGIN', status: 'FAILED' });
//       return res.status(401).json({ error: 'User not found' });
//     }

//     // Determine type for logging
//     const userType = result.rows[0].employeeid ? 'EMPLOYEE' : 'USER'; // Check for employee-specific field

//     if (user.status === 'Disabled' || user.status === 'Inactive') {
//       await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
//       return res.status(403).json({ error: 'Account is disabled.' });
//     }

//     let passwordValid = false;
//     if (user.password && user.password.startsWith('$2')) {
//       passwordValid = await bcrypt.compare(password, user.password);
//     } else {
//       passwordValid = (user.password === password);
//     }

//     if (passwordValid) {
//       await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'SUCCESS' });
      
//       const imgBuffer = user.userImage || user.userimage;
//       let imageStr = null;
//       if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

//       res.json({ 
//         message: 'Login successful', 
//         user: { 
//           id: user.pk, 
//           username: user.username, 
//           fullname: user.fullName || user.fullname, 
//           role: user.role,
//           department: user.department, 
//           userImage: imageStr,
//           isInitialLogin: user.is_initial_login || false
//         } 
//       });
//     } else {
//       await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
//       res.status(401).json({ error: 'Invalid password' });
//     }
//   } catch (err) {
//     console.error("❌ Employee login error:", err.message);
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// // Get All Employees
// app.get('/accounts', async (req, res) => {
//   try {
//     const allAccounts = await pool.query('SELECT * FROM accounts ORDER BY pk ASC');
//     const formattedAccounts = allAccounts.rows.map(account => {
//       const imgBuffer = account.userimage;
//       let imageStr = null;
//       if (imgBuffer) imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
//       return { ...account, userimage: imageStr };
//     });
//     res.json(formattedAccounts);
//   } catch (err) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// // Update Employee Account
// app.put('/accounts/:id', async (req, res) => {
//   const { id } = req.params;
//   const { username, fullname, contactnumber, email, role, department, employeeid, userimage, status } = req.body;

//   try {
//     let imageBuffer = null;
//     if (userimage && userimage.startsWith('data:image')) {
//       const base64Data = userimage.split(',')[1]; 
//       imageBuffer = Buffer.from(base64Data, 'base64');
//     } else if (userimage) {
//       imageBuffer = Buffer.from(userimage, 'base64');
//     }

//     let query, values;
//     if (imageBuffer) {
//       query = `UPDATE accounts SET username=$1, fullname=$2, contactnumber=$3, email=$4, role=$5, department=$6, employeeid=$7, status=$8, userimage=$9 WHERE pk=$10 RETURNING *`;
//       values = [username, fullname, contactnumber, email, role, department, employeeid, status, imageBuffer, id];
//     } else {
//       query = `UPDATE accounts SET username=$1, fullname=$2, contactnumber=$3, email=$4, role=$5, department=$6, employeeid=$7, status=$8 WHERE pk=$9 RETURNING *`;
//       values = [username, fullname, contactnumber, email, role, department, employeeid, status, id];
//     }

//     const updatedAccount = await pool.query(query, values);
//     if (updatedAccount.rows.length === 0) return res.status(404).json({ error: "Account not found" });

//     res.json({ message: "Updated successfully", user: updatedAccount.rows[0] });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// =================================================================================
//  UPDATED PATIENT REGISTRATION (with email verification) 
// =================================================================================

app.post('/patient-register', async (req, res) => {
  console.log("📥 Patient registration request received");
  const { fullname, username, password, contactnumber, email, userimage, datecreated } = req.body;
  
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
    
    // Generate verification token (expires in 24 hours)
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Insert with is_verified = FALSE
    const query = `
      INSERT INTO patient_account 
      (username, password, fullname, contactnumber, email, userimage, datecreated, 
       is_verified, verification_token, verification_token_expiry, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING pk, username, email, fullname
    `;
    const values = [
      username, hashedPassword, fullname, contactnumber.replace(/\D/g, ''), 
      email, imageBuffer, datecreated,
      false, verificationToken, tokenExpiry, 'Pending Verification' // Status set to pending
    ];
    
    const newPatient = await pool.query(query, values);
    const createdPatient = newPatient.rows[0];
    
    console.log(`✅ Patient registered (unverified): ${username}`);
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, fullname, verificationToken);
    
    // AUDIT LOG: REGISTER
    await logAccess({
      req,
      accountId: createdPatient.pk,
      accountType: 'USER',
      username: createdPatient.username,
      role: 'user',
      action: 'REGISTER',
      status: 'SUCCESS'
    });
    
    // Return success but inform user to check email
    res.status(201).json({ 
      message: emailSent 
        ? 'Registration successful! Please check your email to verify your account.' 
        : 'Registration successful! (Verification email could not be sent - please contact support)',
      patient: { 
        pk: createdPatient.pk, 
        username: username, 
        email: email, 
        fullname: fullname,
        requiresVerification: true
      }
    });
    
  } catch (err) {
    console.error("❌ Patient registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================================
//  EMAIL VERIFICATION ENDPOINT (ADD THIS)
// =================================================================================

app.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).send(`
      <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: #d9534f;">❌ Verification Failed</h2>
          <p>No verification token provided.</p>
          <a href="http://localhost:8081" style="color: #3d67ee;">Return to Login</a>
        </body>
      </html>
    `);
  }
  
  try {
    // Find patient with this token and not expired
    const result = await pool.query(
      `SELECT pk, email, fullname, verification_token_expiry 
       FROM patient_account 
       WHERE verification_token = $1 AND is_verified = false`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2 style="color: #d9534f;">❌ Verification Failed</h2>
            <p>Invalid verification link or account already verified.</p>
            <a href="http://localhost:8081" style="color: #3d67ee;">Return to Login</a>
          </body>
        </html>
      `);
    }
    
    const patient = result.rows[0];
    
    // Check if token expired
    if (new Date() > patient.verification_token_expiry) {
      return res.status(400).send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2 style="color: #d9534f;">❌ Verification Failed</h2>
            <p>This verification link has expired. Please request a new one.</p>
            <a href="http://localhost:8081" style="color: #3d67ee;">Return to Login</a>
          </body>
        </html>
      `);
    }
    
    // Update patient as verified
    await pool.query(
      `UPDATE patient_account 
       SET is_verified = true, 
           verification_token = null, 
           verification_token_expiry = null,
           status = 'Active'
       WHERE pk = $1`,
      [patient.pk]
    );
    
    // Send success HTML response
    res.send(`
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h2 { color: #28a745; }
            p { color: #666; line-height: 1.6; }
            .btn { background: #3d67ee; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>✅ Email Verified Successfully!</h2>
            <p>Hello <strong>${patient.fullname}</strong>,</p>
            <p>Your email has been verified. You can now log in to your Furtopia account.</p>
            <a href="http://localhost:8081" class="btn">Go to Login</a>
          </div>
        </body>
      </html>
    `);
    
  } catch (err) {
    console.error("❌ Verification error:", err.message);
    res.status(500).send(`
      <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: #d9534f;">❌ Verification Failed</h2>
          <p>An error occurred while verifying your email.</p>
          <a href="http://localhost:8081" style="color: #3d67ee;">Return to Login</a>
        </body>
      </html>
    `);
  }
});

// =================================================================================
//  RESEND VERIFICATION EMAIL (ADD THIS RIGHT HERE)
// =================================================================================
app.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // Find unverified user
    const result = await pool.query(
      `SELECT pk, fullname, email, verification_token, verification_token_expiry 
       FROM patient_account 
       WHERE email = $1 AND is_verified = false`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No unverified account found with this email' 
      });
    }
    
    const user = result.rows[0];
    
    // Generate new token if old one expired
    let token = user.verification_token;
    let tokenExpiry = user.verification_token_expiry;
    
    if (new Date() > tokenExpiry) {
      token = generateVerificationToken();
      tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await pool.query(
        `UPDATE patient_account 
         SET verification_token = $1, verification_token_expiry = $2 
         WHERE pk = $3`,
        [token, tokenExpiry, user.pk]
      );
    }
    
    // Resend email
    await sendVerificationEmail(email, user.fullname, token);
    
    res.json({ 
      message: 'Verification email resent successfully' 
    });
    
  } catch (err) {
    console.error("❌ Resend verification error:", err.message);
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

// Get All Patients - UPDATED to convert status from bit to string
app.get('/patients', async (req, res) => {
  try {
    const allPatients = await pool.query('SELECT * FROM patient_account ORDER BY pk ASC');
    const formattedPatients = allPatients.rows.map(patient => {
      const imgBuffer = patient.userimage;
      let imageStr = null;
      if (imgBuffer) {
        imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      }
      
      // Convert status from bit to string
      let statusStr = patient.status || 'Disabled'; // Default
      // if (patient.status) {
      //   // Check if it's a buffer or string
      //   if (Buffer.isBuffer(patient.status)) {
      //     // If it's a buffer, convert to string and check
      //     const statusVal = patient.status.toString();
      //     statusStr = statusVal === '1' ? 'Active' : 'Disabled';
      //   } else {
      //     // If it's already a string/number
      //     statusStr = patient.status.toString() === '1' ? 'Active' : 'Disabled';
      //   }
      // }
      
      return { 
        ...patient, 
        userimage: imageStr,
        status: statusStr // Return as string
      };
    });
    res.json(formattedPatients);
  } catch (err) {
    res.status(500).json({ error: 'Server Error fetching patients' });
  }
});

// Update Patient
// Update Patient - UPDATED to handle status conversion
app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { username, fullname, contactnumber, email, userimage, status } = req.body;

  try {
    let imageBuffer = null;
    if (userimage && typeof userimage === 'string') {
      const base64Data = userimage.includes(',') ? userimage.split(',')[1] : userimage;
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    // Convert status string to bit value
    let statusForDb = status || 'Active';
    // if (status === 'Active') {
    //   statusForDb = '1';
    // } else if (status === 'Disabled') {
    //   statusForDb = '0';
    // } else {
    //   statusForDb = status; // If it's already a bit value (1 or 0)
    // }

    let query, values;
    if (imageBuffer) {
      query = `
        UPDATE patient_account 
        SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5, userimage=$6 
        WHERE pk=$7 RETURNING *
      `;
      values = [username, fullname, contactnumber, email, statusForDb, imageBuffer, id];
    } else {
      query = `
        UPDATE patient_account 
        SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5::bit varying 
        WHERE pk=$6 RETURNING *
      `;
      values = [username, fullname, contactnumber, email, statusForDb, id];
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

// 2. Verify OTP - FIXED VERSION
app.post('/verify-otp', async (req, res) => {
  console.log("🔑 OTP verification request");
  console.log("📦 Request body:", req.body);
  
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  
  try {
    let user = null;
    let tableName = '';
    let userType = '';
    
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Check both tables
    const employeeResult = await pool.query(
      'SELECT pk, username, reset_otp, reset_otp_expiry FROM accounts WHERE email = $1',
      [email]
    );
    
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
      userType = 'employee';
      console.log(`✅ Found in accounts table:`, user);
    } else {
      const patientResult = await pool.query('SELECT pk, username, reset_otp, reset_otp_expiry FROM patient_account WHERE email = $1', [email]);
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
        userType = 'patient';
        console.log(`✅ Found in patient_account table:`, user);
      }
    }
    
    if (!user) {
      console.log(`❌ Email not found: ${email}`);
      return res.status(404).json({ error: 'Email not found' });
    }
    
    console.log(`📊 User data:`, {
      hasResetOtp: !!user.reset_otp,
      resetOtp: user.reset_otp,
      providedOtp: otp,
      resetOtpExpiry: user.reset_otp_expiry,
      currentTime: new Date()
    });
    
    // Check if OTP exists and hasn't expired
    if (!user.reset_otp) {
      console.log(`❌ No OTP requested for this email`);
      return res.status(400).json({ error: 'No OTP requested for this email' });
    }
    
    // Convert expiry to Date object if it's a string
    const expiryTime = new Date(user.reset_otp_expiry);
    const currentTime = new Date();
    
    console.log(`⏰ Expiry time: ${expiryTime}`);
    console.log(`⏰ Current time: ${currentTime}`);
    console.log(`⏰ Is expired: ${expiryTime < currentTime}`);
    
    if (expiryTime < currentTime) {
      console.log(`❌ OTP has expired`);
      
      // Clear expired OTP
      await pool.query(
        `UPDATE ${tableName} SET reset_otp = NULL, reset_otp_expiry = NULL WHERE pk = $1`,
        [user.pk]
      );
      
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    // Compare OTPs (convert both to strings for safe comparison)
    if (String(user.reset_otp) !== String(otp)) {
      console.log(`❌ OTP mismatch: stored="${user.reset_otp}", provided="${otp}"`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    console.log(`✅ OTP verified successfully for ${email}`);
    
    // OTP is valid
    res.json({
      message: 'OTP verified successfully',
      userId: user.pk,
      email: email,
      userType: userType
    });
    
  } catch (err) {
    console.error("❌ OTP verification error:", err.message);
    console.error("❌ Full error stack:", err.stack);
    res.status(500).json({ error: 'Failed to verify OTP: ' + err.message });
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

    // FIRST: Check patient_account (most common for users)
    console.log("🔍 Checking patient_account first...");
    const patientResult = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
    if (patientResult.rows.length > 0) {
      user = patientResult.rows[0];
      userType = 'USER'; // Patient/USER
      console.log("✅ Found in patient_account");
    } else {
      // SECOND: Check accounts (employees)
      console.log("🔍 Checking accounts table...");
      const employeeResult = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
      if (employeeResult.rows.length > 0) {
        user = employeeResult.rows[0];
        userType = 'EMPLOYEE';
        console.log("✅ Found in accounts");
      }
    }
    
    if (!user) {
      // Try to log audit but handle if table doesn't exist
      try {
        await logAccess({ req, accountId: null, accountType: 'UNKNOWN', username, role: 'UNKNOWN', action: 'LOGIN', status: 'FAILED' });
      } catch (auditErr) {
        console.log("⚠️ Audit log skipped (table may not exist)");
      }
      return res.status(401).json({ error: 'Account not found' });
    }

    // ADD THIS VERIFICATION CHECK RIGHT HERE:
if (userType === 'USER') {
  // Check if patient is verified
  if (user.is_verified === false) {
    try {
      await logAccess({ req, accountId: user.pk, accountType: 'USER', username: user.username, role: 'user', action: 'LOGIN', status: 'FAILED' });
    } catch (auditErr) {
      console.log("⚠️ Audit log skipped");
    }
    return res.status(403).json({ 
      error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
    });
  }
}
    
    // Check status - handle different status formats
    let isDisabled = false;
    if (user.status === 'Disabled' || user.status === 'Inactive' || user.status === '0') {
      isDisabled = true;
    }
    
    if (isDisabled) {
      try {
        await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
      } catch (auditErr) {
        console.log("⚠️ Audit log skipped");
      }
      return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
    }
    
    // Check password
    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      passwordValid = (user.password === password);
    }
    
    if (passwordValid) {
      // Try to log success but handle if table doesn't exist
      try {
        await logAccess({ 
          req, 
          accountId: user.pk, 
          accountType: userType, 
          username: user.username, 
          role: user.role || 'user', 
          action: 'LOGIN', 
          status: 'SUCCESS' 
        });
      } catch (auditErr) {
        console.log("⚠️ Audit log skipped (table may not exist)");
      }

      // Prepare user response
      const userResponse = {
        id: user.pk,
        username: user.username,
        fullname: user.fullname || user.fullName,
        email: user.email,
        userType: userType === 'USER' ? 'patient' : 'employee',
        status: user.status
      };
      
      // Handle image if exists
      const imgBuffer = user.userimage || user.userImage;
      if (imgBuffer) {
        try {
          userResponse.userImage = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
        } catch (imgErr) {
          console.log("⚠️ Could not process image");
        }
      }

      if (userType === 'EMPLOYEE') {
        userResponse.role = user.role;
        userResponse.isInitialLogin = user.is_initial_login || false;
      }
      
      console.log(`✅ Login successful for: ${username} as ${userType}`);
      res.json({ message: 'Login successful', user: userResponse });
    } else {
      // Failed password
      try {
        await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
      } catch (auditErr) {
        console.log("⚠️ Audit log skipped");
      }
      res.status(401).json({ error: 'Invalid password' });
    }
    
  } catch (err) {
    console.error("❌ Unified login error:", err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// // =================================================================================
// // OLD UNIFIED LOGIN ROUTE (WITH AUDIT) - FIXED
// // =================================================================================
// app.post('/unified-login', async (req, res) => {
//   const { username, password } = req.body;
//   console.log(`🔐 Unified login attempt for: ${username}`);
  
//   try {
//     let user = null;
//     let userType = null;

//     // Check accounts (EMPLOYEE)
//     const employeeResult = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
//     if (employeeResult.rows.length > 0) {
//       user = employeeResult.rows[0];
//       userType = 'EMPLOYEE';
//     } else {
//       // Check patients (USER)
//       const patientResult = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
//       if (patientResult.rows.length > 0) {
//         user = patientResult.rows[0];
//         userType = 'USER'; // Log as USER instead of PATIENT
//       }
//     }
    
//     if (!user) {
//       await logAccess({ req, accountId: null, accountType: 'UNKNOWN', username, role: 'UNKNOWN', action: 'LOGIN', status: 'FAILED' });
//       return res.status(401).json({ error: 'Account not found' });
//     }
    
//     if (user.status === 'Disabled' || user.status === 'Inactive') {
//       await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
//       return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
//     }
    
//     let passwordValid = false;
//     if (user.password && user.password.startsWith('$2')) {
//       passwordValid = await bcrypt.compare(password, user.password);
//     } else {
//       passwordValid = (user.password === password);
//     }
    
//     if (passwordValid) {
//       // SUCCESS LOG
//       await logAccess({ 
//         req, 
//         accountId: user.pk, 
//         accountType: userType, 
//         username: user.username, 
//         role: user.role || 'user', 
//         action: 'LOGIN', 
//         status: 'SUCCESS' 
//       });

//       const userResponse = {
//         id: user.pk,
//         username: user.username,
//         fullname: user.fullname,
//         email: user.email,
//         userType: userType.toLowerCase() === 'user' ? 'patient' : 'employee', // Keep frontend response as 'patient' if needed
//         status: user.status
//       };
      
//       const imgBuffer = user.userimage;
//       if (imgBuffer) userResponse.userImage = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

//       if (userType === 'EMPLOYEE') {
//         userResponse.role = user.role;
//         userResponse.isInitialLogin = user.is_initial_login || false;
//       }
      
//       res.json({ message: 'Login successful', user: userResponse });
//     } else {
//       // FAIL LOG
//       await logAccess({ req, accountId: user.pk, accountType: userType, username: user.username, role: user.role || 'user', action: 'LOGIN', status: 'FAILED' });
//       res.status(401).json({ error: 'Invalid password' });
//     }
    
//   } catch (err) {
//     console.error("❌ Unified login error:", err.message);
//     res.status(500).json({ error: 'Database error: ' + err.message });
//   }
// });

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
      employees: {
        login: 'POST /employee-login',
        register: 'POST /register',
        getAll: 'GET /accounts',
        update: 'PUT /accounts/:id',
        updateCredentials: 'PUT /update-credentials'
      },
      patients: {
        login: 'POST /patient-login',
        register: 'POST /patient-register',
        getAll: 'GET /patients',
        update: 'PUT /patients/:id'
      },
      unified: {
        login: 'POST /unified-login'
      },
      passwordReset: {
        request: 'POST /request-password-reset',
        verify: 'POST /verify-otp',
        reset: 'POST /reset-password'
      },
      availability: {
        dayAvailability: 'GET /api/day-availability',
        updateDay: 'PUT /api/day-availability/:day',
        timeSlots: 'GET /api/time-slots/:day',
        saveTimeSlots: 'POST /api/time-slots/:day',
        deleteTimeSlot: 'DELETE /api/time-slots/:slotId'
      }
    }
  });
});

// =================================================================================
//  AVAILABILITY & APPOINTMENTS ROUTES (Existing)
// =================================================================================

app.post('/test-simple-reset', async (req, res) => {
  console.log("🧪 TEST ENDPOINT: Simple test called");
  console.log("📦 Request body:", req.body);
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required for test' });
  }
  
  // Just return success without touching database
  console.log(`✅ Test successful for email: ${email}`);
  
  res.json({
    message: '✅ TEST: Successful without database',
    email: email,
    otp: '123456',
    userType: 'employee',
    test: true
  });
});

// Add this to test SendGrid connection
app.post('/test-sendgrid-connection', async (req, res) => {
  console.log("🧪 Testing SendGrid connection...");
  
  if (!process.env.SENDGRID_API_KEY) {
    return res.status(500).json({ 
      error: 'SENDGRID_API_KEY not found in .env file' 
    });
  }
  
  try {
    // Test DNS resolution
    const dns = require('dns');
    dns.lookup('api.sendgrid.com', (err, address, family) => {
      if (err) {
        console.error('❌ DNS lookup failed:', err.message);
        return res.status(500).json({ 
          error: `DNS resolution failed: ${err.message}`,
          suggestion: 'Check your internet connection or DNS settings'
        });
      }
      
      console.log(`✅ DNS resolved: api.sendgrid.com -> ${address}`);
      
      // Test actual SendGrid API
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const testMsg = {
        to: 'test@example.com', // Use a real email for testing
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@furtopia.com',
        subject: 'Test Email from Furtopia',
        text: 'This is a test email.',
        html: '<strong>This is a test email.</strong>'
      };
      
      sgMail.send(testMsg)
        .then(() => {
          console.log('✅ SendGrid API test successful');
          res.json({ 
            success: true, 
            message: 'SendGrid connection working',
            dns: { host: 'api.sendgrid.com', ip: address }
          });
        })
        .catch(error => {
          console.error('❌ SendGrid API error:', error.response?.body || error.message);
          res.status(500).json({ 
            error: 'SendGrid API error: ' + (error.response?.body || error.message)
          });
        });
    });
    
  } catch (err) {
    console.error("❌ SendGrid test error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/test-db-connection', async (req, res) => {
  console.log("🧪 Testing database connection...");
  
  try {
    const result = await pool.query('SELECT NOW() as current_time, 1 as test_number');
    console.log("✅ Database connection successful");
    
    res.json({ 
      success: true, 
      message: 'Database connection working',
      dbTime: result.rows[0].current_time,
      test: result.rows[0].test_number
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      message: 'Database connection failed'
    });
  }
});

// =================================================================================
//  SENDGRID TEST ENDPOINT
// =================================================================================

app.post('/test-email', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  if (!process.env.SENDGRID_API_KEY) {
    return res.status(500).json({ error: 'SendGrid API key missing' });
  }
  
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@furtopia.com',
      subject: 'Test Email from Furtopia',
      text: 'This is a test email from Furtopia Veterinary System.',
      html: '<strong>This is a test email from Furtopia Veterinary System.</strong>'
    };
    
    await sgMail.send(msg);
    console.log(`✅ Test email sent to ${email}`);
    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    console.error('❌ Test email failed:', error.response?.body || error.message);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Add this before the server starts (around line 1100)
app.post('/debug-otp-status', async (req, res) => {
  console.log("🔍 DEBUG: Checking OTP status");
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  try {
    let results = {};
    
    // Check accounts table
    const employeeResult = await pool.query(
      'SELECT pk, email, reset_otp, reset_otp_expiry, reset_requested_at FROM accounts WHERE email = $1',
      [email]
    );
    
    if (employeeResult.rows.length > 0) {
      results.employee = employeeResult.rows[0];
      console.log('🔍 Found in accounts table:', results.employee);
    }
    
    // Check patient_account table
    const patientResult = await pool.query(
      'SELECT pk, email, reset_otp, reset_otp_expiry, reset_requested_at FROM patient_account WHERE email = $1',
      [email]
    );
    
    if (patientResult.rows.length > 0) {
      results.patient = patientResult.rows[0];
      console.log('🔍 Found in patient_account table:', results.patient);
    }
    
    if (!results.employee && !results.patient) {
      return res.status(404).json({ error: 'Email not found in any table' });
    }
    
    res.json({
      message: 'OTP status retrieved',
      currentTime: new Date().toISOString(),
      ...results
    });
    
  } catch (err) {
    console.error("❌ Debug error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== NEW AVAILABILITY ROUTES (for new database structure) ==========

// GET day availability (all 7 days)
app.get('/api/day-availability', async (req, res) => {
  console.log("📅 Fetching day availability");
  
  try {
    const result = await pool.query(
      `SELECT * FROM day_availability 
       ORDER BY 
         CASE day_of_week
           WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3
           WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6
           WHEN 'sunday' THEN 7
         END`
    );
    
    res.json({ day_availability: result.rows });
  } catch (err) {
    console.error("❌ Get day availability error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE day availability
app.put('/api/day-availability/:day', async (req, res) => {
  const { day } = req.params;
  const { is_available } = req.body;
  
  console.log(`📅 Updating ${day} to ${is_available}`);
  
  try {
    const result = await pool.query(
      `UPDATE day_availability 
       SET is_available = $1, updated_at = CURRENT_TIMESTAMP
       WHERE day_of_week = $2
       RETURNING *`,
      [is_available, day.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Day not found' });
    }
    
    res.json({ 
      message: 'Day availability updated', 
      day: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ Update day availability error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET time slots for a specific day
app.get('/api/time-slots/:day', async (req, res) => {
  const { day } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM time_slots 
       WHERE day_of_week = $1 AND is_active = true
       ORDER BY start_time`,
      [day.toLowerCase()]
    );
    
    res.json({ timeSlots: result.rows });
  } catch (err) {
    console.error("❌ Get time slots error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// SAVE time slots for a day (replace all)
app.post('/api/time-slots/:day', async (req, res) => {
  const { day } = req.params;
  const { slots } = req.body;
  
  console.log(`📅 Saving time slots for ${day}:`, slots);
  
  try {
    await pool.query('BEGIN');
    
    // Soft delete ALL existing slots for this day
    await pool.query(
      `UPDATE time_slots 
       SET is_active = false 
       WHERE day_of_week = $1`,
      [day.toLowerCase()]
    );
    
    // Insert new slots
    for (const slot of slots) {
      const startTime = convertToTimeFormat(slot.startTime);
      const endTime = convertToTimeFormat(slot.endTime);
      
      await pool.query(
        `INSERT INTO time_slots 
         (day_of_week, start_time, end_time, capacity, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [day.toLowerCase(), startTime, endTime, slot.capacity || 1]
      );
    }
    await pool.query('COMMIT');
    
    // Fetch and return updated slots
    const updated = await pool.query(
      `SELECT * FROM time_slots 
       WHERE day_of_week = $1 AND is_active = true
       ORDER BY start_time`,
      [day.toLowerCase()]
    );
    
    console.log(`✅ Saved ${updated.rows.length} time slots for ${day}`);
    res.json({ 
      message: 'Time slots saved successfully',
      timeSlots: updated.rows
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Helper function to convert time string to PostgreSQL TIME format
function convertToTimeFormat(timeStr) {
  if (!timeStr) return null;
  
  // Handle "9:00 AM" format
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }
  
  return timeStr; // Return as-is if already in correct format
}

// DELETE time slot (soft delete)
app.delete('/api/time-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  try {
    const result = await pool.query(
      `UPDATE time_slots 
       SET is_active = false 
       WHERE id = $1 
       RETURNING *`,
      [slotId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    
    res.json({ 
      message: 'Time slot deleted',
      slot: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== UPDATED APPOINTMENT ROUTES (for new structure) ==========

// GET booked slots count for a specific time slot on a specific date
app.get('/api/appointments/booked-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { date } = req.query;
  
  try {
    // Get slot capacity
    const slotResult = await pool.query(
      `SELECT capacity FROM time_slots WHERE id = $1`,
      [slotId]
    );
    
    if (slotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    
    const capacity = slotResult.rows[0].capacity;
    
    // Count booked appointments for this slot on this date
    const bookedResult = await pool.query(
      `SELECT COUNT(*) as booked_count 
       FROM appointments 
       WHERE time_slot_id = $1 
         AND appointment_date = $2 
         AND status NOT IN ('cancelled', 'no-show')`,
      [slotId, date]
    );
    
    const bookedCount = parseInt(bookedResult.rows[0].booked_count) || 0;
    
    res.json({ 
      slotId, 
      date,
      bookedCount,
      capacity,
      availableSlots: capacity - bookedCount
    });
  } catch (err) {
    console.error("❌ Get booked slots error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// CREATE appointment (Updated - added reasonForVisit)
app.post('/api/appointments', async (req, res) => {
  const { 
    patientName, 
    patientEmail, 
    patientPhone,
    petName,
    petType,
    petGender,
    appointmentType,
    reasonForVisit, // NEW FIELD
    selectedDate,
    timeSlotId,
    timeSlotDisplay,
    doctorId = null
  } = req.body;

  console.log("📅 Creating appointment:", {
    patientName,
    selectedDate,
    timeSlotId,
    reasonForVisit: reasonForVisit ? 'Provided' : 'Not provided'
  });

  try {
    await pool.query('BEGIN');

    // 1. Check if time slot exists and is active
    const slotResult = await pool.query(
      `SELECT * FROM time_slots 
       WHERE id = $1 AND is_active = true
       FOR UPDATE`,
      [timeSlotId]
    );

    if (slotResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot not found or inactive' });
    }
    const slot = slotResult.rows[0];
    const capacity = slot.capacity;

    // 2. Count current bookings for this slot on this date
    const bookedResult = await pool.query(
      `SELECT COUNT(*) as booked_count 
       FROM appointments 
       WHERE time_slot_id = $1 
         AND appointment_date = $2 
         AND status NOT IN ('cancelled', 'no-show')`,
      [timeSlotId, selectedDate]
    );
    
    const currentBookings = parseInt(bookedResult.rows[0].booked_count) || 0;

    // 3. Check if there's available capacity
    if (currentBookings >= capacity) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot is fully booked' });
    }

    // 4. Create the appointment with reason_for_visit
    const appointmentQuery = `
      INSERT INTO appointments 
      (patient_name, patient_email, patient_phone, pet_name, pet_type, pet_gender,
       appointment_type, reason_for_visit, appointment_date, time_slot_id, time_slot_display, doctor_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled')
      RETURNING *
    `;

    const appointmentValues = [
      patientName,
      patientEmail,
      patientPhone,
      petName,
      petType,
      petGender,
      appointmentType,
      reasonForVisit || null, // Use null if empty
      selectedDate,
      timeSlotId,
      timeSlotDisplay,
      doctorId
    ];

    const newAppointment = await pool.query(appointmentQuery, appointmentValues);
    
    await pool.query('COMMIT');

    console.log(`✅ Appointment created for ${patientName}`);

    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointment: newAppointment.rows[0],
      availableSlots: capacity - currentBookings - 1
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// CANCEL appointment (Updated - removed current_bookings update)
app.put('/api/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE appointments 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status != 'cancelled'
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or already cancelled' });
    }
    
    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment: result.rows[0]
    });
    
  } catch (err) {
    console.error("❌ Cancel appointment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== EXISTING APPOINTMENT ROUTES (keep as is) ==========

// GET appointments for a specific date
app.get('/api/appointments/date/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const appointments = await pool.query(`SELECT * FROM appointments WHERE appointment_date = $1 ORDER BY time_slot_display`, [date]);
    res.json({ appointments: appointments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await pool.query(`
      SELECT 
        a.*,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.capacity
      FROM appointments a
      LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
      ORDER BY a.appointment_date DESC, a.time_slot_display
    `);
    
    res.json({ appointments: appointments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET appointments for table (UPDATED with reason_for_visit)
app.get('/api/appointments/table', async (req, res) => {
  try {
    console.log("📋 Fetching appointments for table...");
    
    const appointments = await pool.query(`
      SELECT 
        a.id,
        a.patient_name as "name",
        a.appointment_type as "service",
        a.reason_for_visit as "reasonForVisit",
        CONCAT(
          TO_CHAR(a.appointment_date, 'Mon DD, YYYY'), 
          ' - ', 
          a.time_slot_display
        ) as "date_time",
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN ac."fullname"
          ELSE 'Not Assigned'
        END as "doctor",
        a.doctor_id as "assignedDoctor",
        a.status,
        a.patient_email,
        a.patient_phone,
        a.pet_name,
        a.pet_type,
        COALESCE(a.pet_gender, 'Unknown') as "petGender"
      FROM appointments a
      LEFT JOIN accounts ac ON a.doctor_id = ac.pk
      WHERE a.status != 'cancelled' OR a.status IS NULL
      ORDER BY a.appointment_date, a.time_slot_display
    `);
    
    console.log(`✅ Found ${appointments.rows.length} appointments`);
    
    res.json({ 
      appointments: appointments.rows 
    });
    
  } catch (err) {
    console.error("❌ Get appointments table error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Assign doctor to appointment
app.put('/api/appointments/:id/assign-doctor', async (req, res) => {
  const { id } = req.params;
  const { doctorId } = req.body;
  
  try {
    console.log(`⚕️ Assigning doctor ${doctorId} to appointment ${id}`);
    
    // Check if appointment exists
    const appointmentCheck = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );
    
    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Get doctor's name
    const doctorResult = await pool.query(
      'SELECT "fullname" FROM accounts WHERE pk = $1',
      [doctorId]
    );
    
    const doctorName = doctorResult.rows.length > 0 
      ? doctorResult.rows[0].fullname 
      : 'Unknown Doctor';
    
    // Update appointment with doctor
    const updateQuery = `
      UPDATE appointments 
      SET doctor_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `;
    
    const updatedAppointment = await pool.query(updateQuery, [doctorId, id]);
    
    console.log(`✅ Doctor ${doctorName} assigned to appointment ${id}`);
    
    res.json({ 
      message: 'Doctor assigned successfully', 
      appointment: updatedAppointment.rows[0],
      doctorName: doctorName
    });
    
  } catch (err) {
    console.error("❌ Assign doctor error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Check appointments table columns
app.get('/api/appointments/check-columns', async (req, res) => {
  try {
    console.log("🔍 Checking appointments table columns...");
    
    // Check if doctor_id column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
        AND column_name = 'doctor_id'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the column
      await pool.query(`
        ALTER TABLE appointments 
        ADD COLUMN doctor_id INTEGER REFERENCES accounts(pk)
      `);
      console.log("✅ Added doctor_id column to appointments table");
    } else {
      console.log("✅ doctor_id column already exists");
    }
    
    // Check if pet_gender column exists
    const genderCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
        AND column_name = 'pet_gender'
    `);
    
    if (genderCheck.rows.length === 0) {
      // Add the column
      await pool.query(`
        ALTER TABLE appointments 
        ADD COLUMN pet_gender VARCHAR(20)
      `);
      console.log("✅ Added pet_gender column to appointments table");
    } else {
      console.log("✅ pet_gender column already exists");
    }
    
    // Check if status column exists with default value
    const statusCheck = await pool.query(`
      SELECT column_default
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
        AND column_name = 'status'
    `);
    
    if (statusCheck.rows.length === 0) {
      // Add status column if it doesn't exist
      await pool.query(`
        ALTER TABLE appointments 
        ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled'
      `);
      console.log("✅ Added status column to appointments table");
    } else {
      console.log("✅ status column already exists");
    }
    
    res.json({ 
      message: 'Columns checked/added successfully',
      has_doctor_id: true,
      has_pet_gender: true,
      has_status: true
    });
    
  } catch (err) {
    console.error("❌ Check columns error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== APPOINTMENT STATUS UPDATE ROUTES ==========

// Update appointment status (complete/cancel)
app.put('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  if (!['completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "completed" or "cancelled"' });
  }
  
  try {
    console.log(`🔄 Updating appointment ${id} to ${status}`);
    
    const result = await pool.query(
      `UPDATE appointments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    console.log(`✅ Appointment ${id} marked as ${status}`);
    
    res.json({ 
      message: `Appointment marked as ${status} successfully`,
      appointment: result.rows[0]
    });
    
  } catch (err) {
    console.error(`❌ Error updating appointment status:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET appointment history (completed and cancelled)
app.get('/api/appointments/history', async (req, res) => {
  try {
    console.log("📋 Fetching appointment history...");
    
    const appointments = await pool.query(`
      SELECT 
        a.id,
        a.patient_name as "name",
        a.appointment_type as "service",
        a.reason_for_visit as "reasonForVisit",
        CONCAT(
          TO_CHAR(a.appointment_date, 'Mon DD, YYYY'), 
          ' - ', 
          a.time_slot_display
        ) as "date_time",
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN ac."fullname"
          ELSE 'Not Assigned'
        END as "doctor",
        a.doctor_id as "assignedDoctor",
        a.status,
        a.patient_email,
        a.patient_phone,
        a.pet_name,
        a.pet_type,
        COALESCE(a.pet_gender, 'Unknown') as "petGender"
      FROM appointments a
      LEFT JOIN accounts ac ON a.doctor_id = ac.pk
      WHERE a.status IN ('completed', 'cancelled')
      ORDER BY a.appointment_date DESC, a.time_slot_display
    `);
    
    console.log(`✅ Found ${appointments.rows.length} history appointments`);
    
    res.json({ 
      appointments: appointments.rows 
    });
    
  } catch (err) {
    console.error("❌ Get appointment history error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG: Check appointment status
app.get('/api/debug/appointments', async (req, res) => {
  try {
    console.log("🔍 DEBUG: Fetching all appointments with status");
    
    const appointments = await pool.query(`
      SELECT id, patient_name, status, appointment_date 
      FROM appointments 
      ORDER BY id
    `);
    
    console.log("📊 Appointments in database:");
    appointments.rows.forEach(app => {
      console.log(`   ID: ${app.id}, Name: ${app.patient_name}, Status: "${app.status}"`);
    });
    
    res.json({ 
      message: 'Debug info',
      appointments: appointments.rows 
    });
    
  } catch (err) {
    console.error("❌ Debug error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
  console.log(`📁 Employee endpoints available`);
  console.log(`📁 Patient endpoints available`);
  console.log(`🔗 Unified login at POST /unified-login`);
  console.log(`📧 Password reset endpoints available`);
  console.log(`📅 New availability endpoints:`);
  console.log(`   GET /api/day-availability`);
  console.log(`   PUT /api/day-availability/:day`);
  console.log(`   GET /api/time-slots/:day`);
  console.log(`   POST /api/time-slots/:day`);
  console.log(`   DELETE /api/time-slots/:slotId`);
  console.log(`🧪 Test endpoints: /test-email, /test-db-connection`);
});