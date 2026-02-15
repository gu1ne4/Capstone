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

// =================================================================================
//  EMPLOYEE REGISTRATION - SINGLE, FIXED ENDPOINT
// =================================================================================
app.post('/register', async (req, res) => {
  console.log("📥 Employee registration request received");
  console.log("📦 Request body:", req.body);

  const { 
    fullname, contactnumber, email, 
    role, department, employeeid, userimage, status, datecreated 
  } = req.body;

  // --- Validate required fields ---
  if (!fullname) {
    console.log("❌ Missing required field: fullname");
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (!email) {
    console.log("❌ Missing required field: email");
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!contactnumber) {
    console.log("❌ Missing required field: contactnumber");
    return res.status(400).json({ error: 'Contact number is required' });
  }
  if (!employeeid) {
    console.log("❌ Missing required field: employeeid");
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  // --- Helper function for username generation (defined inside for self-containment) ---
  function generateRandomUsername(name) {
    console.log("🔧 Generating username from:", name);
    // Handle undefined, null, or empty string
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.log("⚠️ Fullname is missing, using fallback");
      const timestamp = Date.now().toString().slice(-6);
      const randomChars = Math.random().toString(36).substring(2, 8);
      return `user_${timestamp}_${randomChars}`;
    }
    try {
      const cleanName = name.toLowerCase().trim();
      const nameParts = cleanName.split(' ');
      const firstName = nameParts[0] || 'user';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const options = [
        `${firstName}.${lastName}.${randomSuffix}`,
        `${firstName.charAt(0)}${lastName}.${randomSuffix}`,
        `${firstName}.${randomSuffix}`
      ];
      const username = options[Math.floor(Math.random() * options.length)]
        .replace(/[^a-z0-9.]/g, '')
        .substring(0, 30);
      console.log("✅ Generated username:", username);
      return username;
    } catch (err) {
      console.log("⚠️ Error generating username:", err.message);
      const timestamp = Date.now().toString().slice(-6);
      return `user_${timestamp}`;
    }
  }

  function generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  try {
    const password = generateRandomPassword();
    console.log("🔑 Generated password for", fullname);
    
    // SAFELY generate username using the fullname
    const username = generateRandomUsername(fullname);
    console.log("👤 Generated username:", username);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const imageBuffer = userimage ? Buffer.from(userimage, 'base64') : null;
    const userStatus = status || 'Active';

    // Format date for PostgreSQL
    let formattedDate;
    if (datecreated && datecreated.includes('/')) {
      const [month, day, year] = datecreated.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      const today = new Date();
      formattedDate = today.toISOString().split('T')[0];
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

    console.log("📊 Inserting values:", { username, fullname, email, role, department, employeeid, status: userStatus, datecreated: formattedDate });
    const newAccount = await pool.query(query, values);
    
    console.log(`✅ Employee registered: ${username}`);

    // --- Send email logic (keep as is) ---
    let emailSent = false;
    if (process.env.SENDGRID_API_KEY) {
      try {
        emailSent = await sendEmployeeCredentialsEmail(email, username, password, fullname, role);
        if (emailSent) {
          console.log(`📧 Credentials email sent to ${email}`);
        } else {
          console.log(`⚠️ Failed to send credentials email to ${email}`);
        }
      } catch (emailError) {
        console.error(`❌ Email sending error:`, emailError.message);
        emailSent = false;
      }
    } else {
      console.log(`⚠️ SendGrid not configured. Generated credentials for ${fullname}: Username: ${username}, Password: ${password}`);
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

// ========== LOGIN ROUTE (RESOLVED) ==========
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Employee login attempt for username: ${username}`);
  
  try {
    // 1. Search for user in both tables
    let result = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
    let user = result.rows.length > 0 ? result.rows[0] : null;

    if (!user) {
        result = await pool.query('SELECT * FROM patient_account WHERE username = $1', [username]);
        user = result.rows.length > 0 ? result.rows[0] : null;
    }

    // 2. If user doesn't exist anywhere
    if (!user) return res.status(401).json({ error: 'User not found' });

    // 3. Check Account Status
    if (user.status === 'Disabled' || user.status === 'Inactive') {
      return res.status(403).json({ error: 'Account is disabled.' });
    }

    // 4. Verify Password (Handles both Hashed and Plain Text)
    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      // Bcrypt hash (new users)
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (old users - backward compatibility)
      passwordValid = (user.password === password);
    }

    if (passwordValid) {
      console.log(`✅ Login successful for: ${username}`);
      
      // Process Image to Base64
      const imgBuffer = user.userImage || user.userimage;
      let imageStr = null;
      if (imgBuffer) {
        imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      }

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

app.post('/patient-register', async (req, res) => {
  console.log("📥 Patient registration request received");
  console.log("📦 Request body:", req.body);
  
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
    
    // Safely handle userimage - if undefined or null, set to null
    let imageBuffer = null;
    if (userimage && typeof userimage === 'string' && userimage.trim() !== '') {
      try {
        imageBuffer = Buffer.from(userimage, 'base64');
      } catch (imgErr) {
        console.log("⚠️ Invalid image data, setting to null");
        imageBuffer = null;
      }
    }
    
    // Check if username already exists
    const usernameCheck = await pool.query(
      'SELECT pk FROM patient_account WHERE username = $1',
      [username]
    );
    
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken. Please choose another.' });
    }
    
    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT pk FROM patient_account WHERE email = $1',
      [email]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered. Please use a different email.' });
    }
    
    // FIXED: Use proper PostgreSQL bit string syntax
    // For bit varying column, we need to use the bit string literal syntax: B'1' or B'0'
    let statusValue;
    if (status === 'Active') {
      statusValue = 'B\'1\''; // Binary 1 for Active
    } else {
      statusValue = 'B\'0\''; // Binary 0 for Disabled/Inactive
    }
    
    console.log(`🔄 Status converted: "${status}" -> ${statusValue} (bit varying)`);
    
    // Use parameterized query with proper casting
    const query = `
      INSERT INTO patient_account 
      (username, password, fullname, contactnumber, email, userimage, status, datecreated) 
      VALUES ($1, $2, $3, $4, $5, $6, $7::bit varying, $8) 
      RETURNING *
    `;
    
    // For status, send '1' or '0' as string and let PostgreSQL cast it to bit varying
    const statusForDb = status === 'Active' ? '1' : '0';
    
    const values = [
      username, 
      hashedPassword, 
      fullname, 
      cleanContact, 
      email, 
      imageBuffer, 
      statusForDb, // Send '1' or '0' as string
      datecreated
    ];
    
    console.log("📊 Inserting patient with values:", {
      username,
      fullname,
      email,
      contactnumber: cleanContact,
      status: statusForDb,
      datecreated,
      hasImage: !!imageBuffer
    });
    
    const newPatient = await pool.query(query, values);
    
    console.log(`✅ Patient registered: ${username}`);
    
    res.status(201).json({ 
      message: 'Patient registered successfully', 
      patient: { 
        pk: newPatient.rows[0].pk, 
        username: username,
        email: email,
        fullname: fullname,
        status: status // Return original status string
      }
    });
    
  } catch (err) {
    console.error("❌ Patient registration error:", err.message);
    console.error("❌ Full error:", err);
    
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
      let statusStr = 'Disabled'; // Default
      if (patient.status) {
        // Check if it's a buffer or string
        if (Buffer.isBuffer(patient.status)) {
          // If it's a buffer, convert to string and check
          const statusVal = patient.status.toString();
          statusStr = statusVal === '1' ? 'Active' : 'Disabled';
        } else {
          // If it's already a string/number
          statusStr = patient.status.toString() === '1' ? 'Active' : 'Disabled';
        }
      }
      
      return { 
        ...patient, 
        userimage: imageStr,
        status: statusStr // Return as string
      };
    });

    console.log(`📤 Sending ${formattedPatients.length} patients to frontend`);
    res.json(formattedPatients);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
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
    let statusForDb;
    if (status === 'Active') {
      statusForDb = '1';
    } else if (status === 'Disabled') {
      statusForDb = '0';
    } else {
      statusForDb = status; // If it's already a bit value (1 or 0)
    }

    let query, values;

    if (imageBuffer) {
      query = `
        UPDATE patient_account 
        SET username=$1, fullname=$2, contactnumber=$3, email=$4, status=$5::bit varying, userimage=$6 
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
      const patientResult = await pool.query(
        'SELECT pk, username, reset_otp, reset_otp_expiry FROM patient_account WHERE email = $1',
        [email]
      );
      
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
        fullname: user.fullname, // Return as fullName for frontend consistency
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
        fullname: updatedUser.rows[0].fullname, // Return as fullName for frontend
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
    console.error("❌ Save time slots error:", err.message);
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
    console.error("❌ Delete time slot error:", err.message);
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
      return res.status(400).json({ 
        error: 'Time slot is fully booked',
        capacity,
        currentBookings,
        availableSlots: 0
      });
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
    console.error("❌ Create appointment error:", err.message);
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
    const appointments = await pool.query(
      `SELECT * FROM appointments 
       WHERE appointment_date = $1 
       ORDER BY time_slot_display`,
      [date]
    );
    
    res.json({ 
      appointments: appointments.rows 
    });
  } catch (err) {
    console.error("❌ Get appointments by date error:", err.message);
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
    console.error("❌ Get appointments error:", err.message);
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