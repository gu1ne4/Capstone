require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt'); // ADD THIS LINE

const app = express();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// ========== GENERATE RANDOM CREDENTIALS ==========
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateRandomUsername(fullName) {
  const nameParts = fullName.toLowerCase().split(' ');
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

// ========== REGISTER ROUTE ==========
app.post('/register', async (req, res) => {
  console.log("📥 Registration request received");
  console.log("Request Body:", req.body);

  const { 
    fullName, contactNumber, email, 
    role, department, employeeID, userImage, status, dateCreated
  } = req.body;

  try {
    const password = generateRandomPassword();
    const username = generateRandomUsername(fullName); 
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const imageBuffer = userImage ? Buffer.from(userImage, 'base64') : null;
    const userStatus = status || 'Active';

    const query = `
      INSERT INTO accounts 
      ("username", "password", "fullName", "contactNumber", "email", "role", 
       "department", "employeeID", "userImage", "status", "datecreated", "is_initial_login") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE) 
      RETURNING *
    `;

    const values = [
      username, hashedPassword, fullName, contactNumber, email, 
      role, department, employeeID, imageBuffer, userStatus, dateCreated
    ];

    const newAccount = await pool.query(query, values);
    
    // Send email
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Your Veterinary System Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Veterinary System Account Created</h2>
          <p>Hello ${fullName},</p>
          <p>Your employee account has been successfully created.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Your Login Credentials:</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Username:</strong></td>
                <td style="padding: 8px 0;"><code style="background: #eee; padding: 4px 8px; border-radius: 3px;">${username}</code></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Temporary Password:</strong></td>
                <td style="padding: 8px 0;"><code style="background: #eee; padding: 4px 8px; border-radius: 3px;">${password}</code></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Role:</strong></td>
                <td style="padding: 8px 0;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Department:</strong></td>
                <td style="padding: 8px 0;">${department}</td>
              </tr>
            </table>
          </div>
          
          <p><strong>Important Security Instructions:</strong></p>
          <ol>
            <li>Use the credentials above to log in to the system</li>
            <li>You will be required to change your password on first login</li>
            <li>Do not share your credentials with anyone</li>
            <li>Contact IT support if you encounter any issues</li>
          </ol>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${email}`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
    }
    
    res.status(201).json({ 
      message: 'Registered successfully', 
      user: { 
        pk: newAccount.rows[0].pk, 
        username: username,
        email: email,
        fullName: fullName
      },
      emailSent: true
    });

  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== LOGIN ROUTE (UPDATED) ==========
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Login attempt for username: ${username}`);
  
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE username = $1', 
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
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
      console.log(`✅ Login successful for: ${username}`);
      console.log(`   is_initial_login: ${user.is_initial_login}`);
      
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.pk, 
          username: user.username,
          fullName: user.fullname || user.fullName,
          role: user.role,
          isInitialLogin: user.is_initial_login || false
        } 
      });
    } else {
      console.log(`❌ Invalid password for: ${username}`);
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ========== UPDATE CREDENTIALS ROUTE ==========
app.put('/update-credentials', async (req, res) => {
  console.log("📝 Update credentials request received");
  console.log("Request Body:", req.body);

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
      RETURNING pk, username, fullname as "fullName", role, is_initial_login as "isInitialLogin"
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
      user: updatedUser.rows[0]
    });

  } catch (err) {
    console.error("❌ Update credentials error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== GET ALL ACCOUNTS ==========
app.get('/accounts', async (req, res) => {
  try {
    const allAccounts = await pool.query('SELECT * FROM accounts ORDER BY pk ASC');
    
    const formattedAccounts = allAccounts.rows.map(account => {
      const imgBuffer = account.userImage || account.userimage;
      let imageStr = null;
      if (imgBuffer) {
        imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      }
      return { ...account, userImage: imageStr };
    });

    res.json(formattedAccounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ========== UPDATE ACCOUNT ==========
app.put('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    username, fullName, contactNumber, email, 
    role, department, employeeID, userImage, status 
  } = req.body;

  try {
    let imageBuffer = null;
    if (userImage && userImage.startsWith('data:image')) {
      const base64Data = userImage.split(',')[1]; 
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (userImage) {
      imageBuffer = Buffer.from(userImage, 'base64');
    }

    let query, values;
    if (imageBuffer) {
      query = `
        UPDATE accounts 
        SET "username" = $1, "fullName" = $2, "contactNumber" = $3, 
            "email" = $4, "role" = $5, "department" = $6, 
            "employeeID" = $7, "status" = $8, "userImage" = $9
        WHERE pk = $10 RETURNING *
      `;
      values = [username, fullName, contactNumber, email, role, department, employeeID, status, imageBuffer, id];
    } else {
      query = `
        UPDATE accounts 
        SET "username" = $1, "fullName" = $2, "contactNumber" = $3, 
            "email" = $4, "role" = $5, "department" = $6, 
            "employeeID" = $7, "status" = $8
        WHERE pk = $9 RETURNING *
      `;
      values = [username, fullName, contactNumber, email, role, department, employeeID, status, id];
    }

    const updatedAccount = await pool.query(query, values);
    if (updatedAccount.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    console.log("✅ User Updated:", updatedAccount.rows[0].username);
    res.json({ message: "Updated successfully", user: updatedAccount.rows[0] });

  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});