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
      text: `
Password Reset Request

Hello ${username},

Your password reset OTP code is: ${otp}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.

Furtopia Veterinary Management System
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #3d67ee; text-align: center; }
    .otp-box { 
      background: #f0f7ff; 
      border-radius: 8px; 
      padding: 20px; 
      text-align: center; 
      margin: 20px 0; 
      border: 1px solid #d0e0ff;
    }
    .otp-code { 
      font-size: 32px; 
      font-weight: bold; 
      letter-spacing: 5px; 
      color: #3d67ee; 
      margin: 10px 0;
    }
    .footer { 
      margin-top: 30px; 
      padding-top: 20px; 
      border-top: 1px solid #eee; 
      color: #666; 
      fontSize: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Password Reset Request</h2>
    <p>Hello <strong>${username}</strong>,</p>
    <p>We received a request to reset your password for your ${userType} account at Furtopia Veterinary.</p>
    
    <div class="otp-box">
      <p>Your OTP Code:</p>
      <div class="otp-code">${otp}</div>
      <p><small>Valid for 15 minutes</small></p>
    </div>
    
    <p><strong>Instructions:</strong></p>
    <ol>
      <li>Enter the OTP code in the password reset page</li>
      <li>Create a new password</li>
      <li>Login with your new credentials</li>
    </ol>
    
    <p>If you didn't request this password reset, please ignore this email.</p>
    
    <div class="footer">
      <p>Furtopia Veterinary Management System</p>
      <p>This is an automated message, please do not reply</p>
    </div>
  </div>
</body>
</html>
      `
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
      text: `
Welcome to Furtopia Veterinary System!

Hello ${fullname},

Your employee account has been created successfully.

Account Details:
- Username: ${username}
- Password: ${password}
- Role: ${role}

Please login to the system and change your password immediately for security.

Login URL: http://localhost:8081

Important: This is a temporary password. Please change it on your first login.

Furtopia Veterinary Management System
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #3d67ee; text-align: center; }
    .credentials-box { 
      background: #f0f7ff; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
      border: 1px solid #d0e0ff;
    }
    .credential-item { 
      margin: 10px 0; 
      padding: 10px;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #3d67ee;
    }
    .highlight { 
      font-weight: bold; 
      color: #3d67ee; 
    }
    .warning-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .footer { 
      margin-top: 30px; 
      padding-top: 20px; 
      border-top: 1px solid #eee; 
      color: #666; 
      font-size: 12px;
    }
    .btn {
      display: inline-block;
      background: #3d67ee;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to Furtopia Veterinary System</h2>
    <p>Hello <strong>${fullname}</strong>,</p>
    <p>Your employee account has been created successfully.</p>
    
    <div class="credentials-box">
      <h3>Your Login Credentials</h3>
      
      <div class="credential-item">
        <strong>Username:</strong>
        <div class="highlight">${username}</div>
      </div>
      
      <div class="credential-item">
        <strong>Password:</strong>
        <div class="highlight">${password}</div>
      </div>
      
      <div class="credential-item">
        <strong>Role:</strong>
        <div>${role}</div>
      </div>
    </div>
    
    <div class="warning-box">
      <p><strong>⚠️ Important Security Notice:</strong></p>
      <p>This is a temporary password. For security reasons, you must:</p>
      <ol>
        <li>Login immediately using the credentials above</li>
        <li>Change your password on first login</li>
        <li>Do not share these credentials with anyone</li>
      </ol>
    </div>
    
    <p><strong>Login Instructions:</strong></p>
    <ol>
      <li>Go to the login page: <a href="http://localhost:8081">http://localhost:8081</a></li>
      <li>Enter your username and temporary password</li>
      <li>You will be prompted to change your password immediately</li>
      <li>After changing password, you can access the full system</li>
    </ol>
    
    <p>
      <a href="http://localhost:8081" class="btn">Login to System</a>
    </p>
    
    <div class="footer">
      <p>Furtopia Veterinary Management System</p>
      <p>This is an automated message, please do not reply</p>
      <p><small>If you did not expect this email, please contact your system administrator.</small></p>
    </div>
  </div>
</body>
</html>
      `
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

// Employee Registration (Auto-generates credentials)
app.post('/register', async (req, res) => {
  console.log("📥 Employee registration request received");
  
  // Log the received data for debugging
  console.log("📦 Request body:", req.body);

  const { 
    fullname, contactnumber, email, 
    role, department, employeeid, userimage, status, datecreated 
  } = req.body;

  try {
    // Auto-generate credentials for employees
    function generateRandomPassword(length = 12) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    }

    function generateRandomUsername(fullname) {
      const nameParts = fullname.toLowerCase().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      
      const options = [
        `${firstName}.${lastName}.${randomSuffix}`,
        `${firstName.charAt(0)}${lastName}.${randomSuffix}`,
        `${firstName}.${randomSuffix}`
      ];
      
      return options[Math.floor(Math.random() * options.length)].replace(/[^a-z0-9.]/g, '');
    }

    const password = generateRandomPassword();
    const username = generateRandomUsername(fullname); 
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const imageBuffer = userimage ? Buffer.from(userimage, 'base64') : null;
    const userStatus = status || 'Active';

    // Convert datecreated string to PostgreSQL date format
    let formattedDate;
    if (datecreated && datecreated.includes('/')) {
      // Convert "MM/DD/YYYY" to "YYYY-MM-DD" for PostgreSQL
      const [month, day, year] = datecreated.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      // Use current date if not provided
      const today = new Date();
      formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    }

    console.log(`📅 Date formatting: ${datecreated} -> ${formattedDate}`);

    const query = `
      INSERT INTO accounts 
      (username, password, fullname, contactnumber, email, role, 
       department, employeeid, userimage, status, datecreated, is_initial_login) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE) 
      RETURNING *
    `;

    const values = [
      username, hashedPassword, fullname, contactnumber, email, 
      role, department, employeeid, imageBuffer, userStatus, formattedDate
    ];

    console.log("📊 Inserting values:", {
      username,
      fullname,
      email,
      role,
      department,
      employeeid,
      status: userStatus,
      datecreated: formattedDate
    });

    const newAccount = await pool.query(query, values);
    
    console.log(`✅ Employee registered: ${username}`);
    
    // === SEND EMAIL WITH CREDENTIALS ===
    let emailSent = false;
    if (process.env.SENDGRID_API_KEY) {
      try {
        emailSent = await sendEmployeeCredentialsEmail(
          email, 
          username, 
          password, 
          fullname,
          role
        );
        
        if (emailSent) {
          console.log(`📧 Credentials email sent to ${email}`);
        } else {
          console.log(`⚠️  Failed to send credentials email to ${email}`);
        }
      } catch (emailError) {
        console.error(`❌ Email sending error:`, emailError.message);
        emailSent = false;
      }
    } else {
      console.log(`⚠️  SendGrid not configured. Cannot send credentials email.`);
      console.log(`🔑 Generated credentials for ${fullname}:`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
    }
    
    res.status(201).json({ 
      message: 'Employee registered successfully', 
      user: { 
        pk: newAccount.rows[0].pk, 
        username: username,
        email: email,
        fullname: fullname
      }
    });

  } catch (err) {
    console.error("❌ Employee registration error:", err.message);
    console.error("❌ Full error stack:", err.stack);
    
    // Handle duplicate errors
    if (err.message.includes('duplicate key')) {
      if (err.message.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (err.message.includes('email')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (err.message.includes('employeeid')) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Employee Login
app.post('/employee-login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Employee login attempt for username: ${username}`);
  
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE username = $1', 
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Employee account not found' });
    }

    const user = result.rows[0];
    
    // Check account status
    if (user.status === 'Disabled' || user.status === 'Inactive') {
      return res.status(403).json({ error: 'Account is disabled.' });
    }

    let passwordValid = false;
    
    // Handle both bcrypt hashed and plain text passwords
    if (user.password && user.password.startsWith('$2')) {
      // Bcrypt hash (new users)
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (old users - backward compatibility)
      passwordValid = (user.password === password);
    }

    if (passwordValid) {
      console.log(`✅ Employee login successful for: ${username}`);
      console.log(`   is_initial_login: ${user.is_initial_login}`);
      
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.pk, 
          username: user.username,
          fullname: user.fullname,
          role: user.role,
          isInitialLogin: user.is_initial_login || false,
          userType: 'employee'
        } 
      });
    } else {
      console.log(`❌ Invalid password for: ${username}`);
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
      if (imgBuffer) {
        imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      }
      return { ...account, userimage: imageStr };
    });

    res.json(formattedAccounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update Employee Account
app.put('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    username, fullname, contactnumber, email, 
    role, department, employeeid, userimage, status 
  } = req.body;

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
      query = `
        UPDATE accounts 
        SET username = $1, fullname = $2, contactnumber = $3, 
            email = $4, role = $5, department = $6, 
            employeeid = $7, status = $8, userimage = $9
        WHERE pk = $10 RETURNING *
      `;
      values = [username, fullname, contactnumber, email, role, department, employeeid, status, imageBuffer, id];
    } else {
      query = `
        UPDATE accounts 
        SET username = $1, fullname = $2, contactnumber = $3, 
            email = $4, role = $5, department = $6, 
            employeeid = $7, status = $8
        WHERE pk = $9 RETURNING *
      `;
      values = [username, fullname, contactnumber, email, role, department, employeeid, status, id];
    }

    const updatedAccount = await pool.query(query, values);
    if (updatedAccount.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    console.log("✅ Employee Updated:", updatedAccount.rows[0].username);
    res.json({ message: "Updated successfully", user: updatedAccount.rows[0] });

  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================================
//  PATIENT ROUTES (Updated - Patients choose their own credentials)
// =================================================================================

// Patient Registration (Patients choose their own username/password)
app.post('/patient-register', async (req, res) => {
  console.log("📥 Patient registration request received");
  
  const { 
    fullname, username, password, contactnumber, email,
    userimage, status, datecreated 
  } = req.body;
  
  // Server-side validation
  if (!fullname || !username || !password || !email || !contactnumber) {
    return res.status(400).json({ error: "All fields are required." });
  }
  
  // Full Name validation: No numbers
  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  if (!nameRegex.test(fullname)) {
    return res.status(400).json({ error: "Full Name should contain only letters, spaces, hyphens, apostrophes, and periods." });
  }
  
  // Username validation: 4-20 characters, letters, numbers, dots, underscores
  const usernameRegex = /^[a-zA-Z0-9._]{4,20}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: "Username must be 4-20 characters and can only contain letters, numbers, dots, and underscores." });
  }
  
  // Password validation: 8-30 characters
  if (password.length < 8 || password.length > 30) {
    return res.status(400).json({ error: "Password must be 8-30 characters long." });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  
  // Contact Number validation: Only numbers, 7-15 digits
  const contactRegex = /^\d{7,15}$/;
  const cleanContact = contactnumber.replace(/\D/g, '');
  if (!contactRegex.test(cleanContact)) {
    return res.status(400).json({ error: "Contact number must be 7-15 digits and contain only numbers." });
  }
  
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const imageBuffer = userimage ? Buffer.from(userimage, 'base64') : null;
    const patientStatus = status || 'Active';
    
    // Check if username already exists in patient_account
    const usernameCheck = await pool.query(
      'SELECT pk FROM patient_account WHERE username = $1',
      [username]
    );
    
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken. Please choose another.' });
    }
    
    // Check if email already exists in patient_account
    const emailCheck = await pool.query(
      'SELECT pk FROM patient_account WHERE email = $1',
      [email]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered. Please use a different email.' });
    }
    
    const query = `
      INSERT INTO patient_account 
      (username, password, fullname, contactnumber, email, userimage, status, datecreated) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    
    const values = [
      username, hashedPassword, fullname, cleanContact, 
      email, imageBuffer, patientStatus, datecreated
    ];
    
    const newPatient = await pool.query(query, values);
    
    console.log(`✅ Patient registered: ${username}`);
    console.log(`   Name: ${fullname}`);
    console.log(`   Email: ${email}`);
    
    res.status(201).json({ 
      message: 'Patient registered successfully', 
      patient: { 
        pk: newPatient.rows[0].pk, 
        username: username,
        email: email,
        fullname: fullname
      }
    });
    
  } catch (err) {
    console.error("❌ Patient registration error:", err.message);
    
    // Check for duplicate key errors
    if (err.message.includes('duplicate key')) {
      if (err.message.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (err.message.includes('email')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Patient Login
app.post('/patient-login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Patient login attempt for username: ${username}`);
  
  try {
    const result = await pool.query(
      'SELECT * FROM patient_account WHERE username = $1', 
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Patient account not found' });
    }

    const patient = result.rows[0];
    
    // Check account status
    if (patient.status === 'Disabled' || patient.status === 'Inactive') {
      return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
    }

    // Patient passwords are bcrypt hashed now
    const passwordValid = await bcrypt.compare(password, patient.password);

    if (passwordValid) {
      console.log(`✅ Patient login successful for: ${username}`);
      
      // Convert image buffer to base64 if exists
      const imgBuffer = patient.userimage;
      let imageStr = null;
      if (imgBuffer) {
        imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      }
      
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
      console.log(`❌ Invalid password for patient: ${username}`);
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
      if (imgBuffer) {
        imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      }
      return { ...patient, userimage: imageStr };
    });

    console.log(`📤 Sending ${formattedPatients.length} patients to frontend`);
    res.json(formattedPatients);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
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
      query = `
        UPDATE patient_account 
        SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5, userimage=$6 
        WHERE pk=$7 RETURNING *
      `;
      values = [username, fullname, contactnumber, email, status, imageBuffer, id];
    } else {
      query = `
        UPDATE patient_account 
        SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5 
        WHERE pk=$6 RETURNING *
      `;
      values = [username, fullname, contactnumber, email, status, id];
    }

    const updated = await pool.query(query, values);
    
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    console.log(`✅ Patient updated: ${updated.rows[0].username}`);
    res.json({ message: "Updated successfully", patient: updated.rows[0] });

  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================================
//  FORGOT PASSWORD ROUTES (UPDATED - No userType required) - FIXED
// =================================================================================

// 1. Request Password Reset (Generate OTP) - UPDATED WITH EMAIL
app.post('/request-password-reset', async (req, res) => {
  console.log("📧 Password reset request received");
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    let user = null;
    let tableName = '';
    let userType = '';
    
    // First check employee accounts
    const employeeResult = await pool.query(
      'SELECT pk, username, fullname, email FROM accounts WHERE email = $1',
      [email]
    );
    
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
      userType = 'employee';
      console.log(`✅ Found employee: ${user.username}`);
    } else {
      // If not found in employees, check patients
      const patientResult = await pool.query(
        'SELECT pk, username, fullname, email FROM patient_account WHERE email = $1',
        [email]
      );
      
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
        userType = 'patient';
        console.log(`✅ Found patient: ${user.username}`);
      }
    }
    
    if (!user) {
      console.log(`❌ Email not found: ${email}`);
      return res.status(404).json({ error: 'Email not found in our system' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    console.log(`🔑 Generated OTP: ${otp}`);
    console.log(`⏰ Expires at: ${expiryTime}`);
    
    // Store OTP in database
    await pool.query(
      `UPDATE ${tableName} 
       SET reset_otp = $1, 
           reset_otp_expiry = $2,
           reset_requested_at = CURRENT_TIMESTAMP
       WHERE pk = $3`,
      [otp, expiryTime, user.pk]
    );
    
    console.log(`💾 OTP stored in database for ${email}`);
    
    // FIXED: Better email sending logic
    let emailSent = false;
    if (process.env.SENDGRID_API_KEY) {
      try {
        emailSent = await sendPasswordResetEmail(
          email, 
          otp, 
          userType, 
          user.username
        );
        
        if (emailSent) {
          console.log(`📧 Email sent successfully to ${email}`);
        } else {
          console.log(`⚠️  Email failed to send for ${email}`);
        }
      } catch (emailError) {
        console.error(`❌ Email sending error:`, emailError.message);
        emailSent = false;
      }
    } else {
      console.log(`⚠️  SendGrid not configured. OTP for ${email}: ${otp}`);
      emailSent = false;
    }
    
    res.json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (check logs for OTP)',
      userId: user.pk,
      email: user.email,
      userType: userType,
      otp: otp // Keep for development/testing
    });
    
  } catch (err) {
    console.error("❌ Password reset request error:", err.message);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// 2. Verify OTP - UPDATED
app.post('/verify-otp', async (req, res) => {
  console.log("🔑 OTP verification request");
  
  const { email, otp } = req.body; // No userType needed
  
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  
  try {
    let user = null;
    let tableName = '';
    let userType = '';
    
    // Check both tables
    const employeeResult = await pool.query(
      'SELECT pk, username, reset_otp, reset_otp_expiry FROM accounts WHERE email = $1',
      [email]
    );
    
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
      userType = 'employee';
    } else {
      const patientResult = await pool.query(
        'SELECT pk, username, reset_otp, reset_otp_expiry FROM patient_account WHERE email = $1',
        [email]
      );
      
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
        userType = 'patient';
      }
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Check if OTP exists and hasn't expired
    if (!user.reset_otp) {
      return res.status(400).json({ error: 'No OTP requested for this email' });
    }
    
    if (user.reset_otp_expiry < new Date()) {
      // Clear expired OTP
      await pool.query(
        `UPDATE ${tableName} SET reset_otp = NULL, reset_otp_expiry = NULL WHERE pk = $1`,
        [user.pk]
      );
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    // Verify OTP
    if (user.reset_otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP is valid
    res.json({
      message: 'OTP verified successfully',
      userId: user.pk,
      email: email,
      userType: userType
    });
    
  } catch (err) {
    console.error("❌ OTP verification error:", err.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 3. Reset Password with OTP - UPDATED (with debug logs)
app.post('/reset-password', async (req, res) => {
  console.log("🔄 Password reset request");
  console.log("📦 Request body:", req.body);
  
  const { email, otp, newPassword } = req.body; // No userType needed
  
  if (!email || !otp || !newPassword) {
    console.log("❌ Missing fields");
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Password validation
  if (newPassword.length < 8 || newPassword.length > 30) {
    console.log("❌ Password validation failed");
    return res.status(400).json({ error: 'Password must be 8-30 characters' });
  }
  
  try {
    let user = null;
    let tableName = '';
    
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Check both tables
    const employeeResult = await pool.query(
      'SELECT pk, reset_otp, reset_otp_expiry FROM accounts WHERE email = $1',
      [email]
    );
    
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      tableName = 'accounts';
      console.log(`✅ Found in accounts table:`, user);
    } else {
      const patientResult = await pool.query(
        'SELECT pk, reset_otp, reset_otp_expiry FROM patient_account WHERE email = $1',
        [email]
      );
      
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        tableName = 'patient_account';
        console.log(`✅ Found in patient_account table:`, user);
      }
    }
    
    if (!user) {
      console.log(`❌ Email not found in any table: ${email}`);
      return res.status(404).json({ error: 'Email not found' });
    }
    
    console.log(`🔍 User found:`, user);
    console.log(`📊 Stored OTP: ${user.reset_otp}`);
    console.log(`📊 Provided OTP: ${otp}`);
    console.log(`📊 OTP expiry: ${user.reset_otp_expiry}`);
    console.log(`📊 Current time: ${new Date()}`);
    
    // Verify OTP is still valid
    if (!user.reset_otp) {
      console.log(`❌ No OTP stored for this user`);
      return res.status(400).json({ error: 'No OTP requested for this email' });
    }
    
    if (user.reset_otp !== otp) {
      console.log(`❌ OTP mismatch: ${user.reset_otp} != ${otp}`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    if (user.reset_otp_expiry < new Date()) {
      console.log(`❌ OTP expired at ${user.reset_otp_expiry}, current time is ${new Date()}`);
      // Clear expired OTP
      await pool.query(
        `UPDATE ${tableName} SET reset_otp = NULL, reset_otp_expiry = NULL WHERE pk = $1`,
        [user.pk]
      );
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    console.log(`✅ OTP verified successfully`);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear OTP
    console.log(`🔄 Updating password for user ID: ${user.pk}`);
    await pool.query(
      `UPDATE ${tableName} 
       SET password = $1, 
           reset_otp = NULL, 
           reset_otp_expiry = NULL,
           reset_requested_at = NULL
       WHERE pk = $2`,
      [hashedPassword, user.pk]
    );
    
    console.log(`✅ Password reset successful for ${email}`);
    
    res.json({
      message: 'Password reset successfully',
      success: true
    });
    
  } catch (err) {
    console.error("❌ Password reset error:", err.message);
    console.error("❌ Full error:", err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// =================================================================================
//  UNIFIED LOGIN ROUTE (Checks Both Tables) - FIXED
// =================================================================================
app.post('/unified-login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Unified login attempt for: ${username}`);
  console.log(`📦 Request body:`, req.body);
  
  try {
    // 1. First check employee accounts
    let user = null;
    let userType = null;
    
    console.log(`🔍 Checking accounts table for username: ${username}`);
    
    // Check accounts table (employees) - UPDATED for lowercase columns
    const employeeResult = await pool.query(
      'SELECT pk, username, fullname, email, password, status, role, userimage, is_initial_login FROM accounts WHERE username = $1',
      [username]
    );
    
    console.log(`📊 Employee query result: ${employeeResult.rows.length} rows found`);
    
    if (employeeResult.rows.length > 0) {
      user = employeeResult.rows[0];
      userType = 'employee';
      console.log(`✅ Found employee: ${user.username}, password column: ${user.password ? 'exists' : 'null'}`);
    } else {
      // Check patient_account table (patients) - UPDATED for lowercase columns
      console.log(`🔍 Checking patient_account table for username: ${username}`);
      const patientResult = await pool.query(
        'SELECT pk, username, fullname, email, password, status, userimage FROM patient_account WHERE username = $1',
        [username]
      );
      
      console.log(`📊 Patient query result: ${patientResult.rows.length} rows found`);
      
      if (patientResult.rows.length > 0) {
        user = patientResult.rows[0];
        userType = 'patient';
        console.log(`✅ Found patient: ${user.username}, password column: ${user.password ? 'exists' : 'null'}`);
      }
    }
    
    if (!user) {
      console.log(`❌ User not found in any table: ${username}`);
      return res.status(401).json({ error: 'Account not found' });
    }
    
    // Check account status
    console.log(`📊 User status: ${user.status}`);
    if (user.status === 'Disabled' || user.status === 'Inactive') {
      return res.status(403).json({ 
        error: 'Account is disabled. Please contact support.' 
      });
    }
    
    // Verify password (both use bcrypt now)
    let passwordValid = false;
    
    console.log(`🔍 Password verification for ${userType}`);
    console.log(`📊 Stored password (first 10 chars): ${user.password ? user.password.substring(0, 10) + '...' : 'NULL'}`);
    
    if (user.password && user.password.startsWith('$2')) {
      // Bcrypt hash (new users - both employees and patients)
      console.log(`🔄 Using bcrypt comparison`);
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (old employee users - backward compatibility)
      console.log(`🔄 Using plain text comparison`);
      passwordValid = (user.password === password);
    }
    
    console.log(`📊 Password valid: ${passwordValid}`);
    
    if (passwordValid) {
      console.log(`✅ ${userType} login successful for: ${username}`);
      
      // Prepare user response
      const userResponse = {
        id: user.pk,
        username: user.username,
        fullName: user.fullname, // Return as fullName for frontend consistency
        email: user.email,
        userType: userType,
        status: user.status
      };
      
      // Add role for employees
      if (userType === 'employee') {
        userResponse.role = user.role;
        userResponse.isInitialLogin = user.is_initial_login || false;
        
        // Convert image for employees
        const imgBuffer = user.userimage;
        if (imgBuffer) {
          userResponse.userImage = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
        }
      } else {
        // Convert image for patients
        const imgBuffer = user.userimage;
        if (imgBuffer) {
          userResponse.userImage = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
        }
      }
      
      res.json({ 
        message: 'Login successful',
        user: userResponse
      });
    } else {
      console.log(`❌ Invalid password for ${userType}: ${username}`);
      console.log(`❌ Provided password: ${password}`);
      console.log(`❌ Stored password: ${user.password}`);
      res.status(401).json({ error: 'Invalid password' });
    }
    
  } catch (err) {
    console.error("❌ Unified login error:", err.message);
    console.error("❌ Full error stack:", err.stack);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// =================================================================================
//  OTHER SHARED ROUTES
// =================================================================================

// Update Credentials (for employees)
app.put('/update-credentials', async (req, res) => {
  console.log("📝 Update credentials request received");

  const { userId, newUsername, newPassword } = req.body;

  try {
    // 1. Check if new username already exists (excluding current user)
    const usernameCheck = await pool.query(
      'SELECT pk FROM accounts WHERE username = $1 AND pk != $2',
      [newUsername, userId]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update user credentials and set is_initial_login to false
    const updateQuery = `
      UPDATE accounts 
      SET username = $1, password = $2, is_initial_login = FALSE 
      WHERE pk = $3 
      RETURNING pk, username, fullname, role, is_initial_login
    `;

    const updatedUser = await pool.query(updateQuery, [
      newUsername, 
      hashedPassword, 
      userId
    ]);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Credentials updated for user ID: ${userId}`);
    console.log(`   New username: ${newUsername}`);

    res.json({ 
      message: 'Credentials updated successfully', 
      user: {
        pk: updatedUser.rows[0].pk,
        username: updatedUser.rows[0].username,
        fullName: updatedUser.rows[0].fullname, // Return as fullName for frontend
        role: updatedUser.rows[0].role,
        isInitialLogin: updatedUser.rows[0].is_initial_login || false
      }
    });

  } catch (err) {
    console.error("❌ Update credentials error:", err.message);
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
      }
    }
  });
});

// =================================================================================
//  TEST ENDPOINT (FOR DEBUGGING)
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

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
  console.log(`📁 Employee endpoints available`);
  console.log(`📁 Patient endpoints available`);
  console.log(`🔗 Unified login at POST /unified-login`);
  console.log(`📧 Password reset endpoints available`);
  console.log(`🧪 Test endpoints: /test-email, /test-db-connection`);
});