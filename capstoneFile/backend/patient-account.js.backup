require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const sgMail = require('@sendgrid/mail');

const app = express();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- NEW: Request Logger (Helps debug connections) ---
app.use((req, res, next) => {
  console.log(`[Patient Server] Received: ${req.method} ${req.path}`);
  next();
});

// Database Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hospital',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) return console.error('❌ Error acquiring client', err.stack);
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) return console.error('❌ Error executing query', err.stack);
    console.log('✅ [Patient DB] Connected to PostgreSQL (hospital db) successfully');
  });
});

// ========== UTILITIES ==========
function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateRandomUsername(fullName) {
  if (!fullName) return 'user' + Math.floor(1000 + Math.random() * 9000); 
  
  const nameParts = fullName.toLowerCase().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  // Example: john.doe.1234
  return `${firstName}.${lastName}.${randomSuffix}`.replace(/[^a-z0-9.]/g, '');
}

// =================================================================================
//  PATIENT ROUTES
// =================================================================================

// 0. ROOT ROUTE (For Browser Testing)
app.get('/', (req, res) => {
    res.send('✅ Patient Server is running on Port 3001!');
});

// 1. GET ALL PATIENTS
app.get('/patients', async (req, res) => {
  try {
    const allPatients = await pool.query('SELECT * FROM patient_account ORDER BY pk ASC');
    
    const formatted = allPatients.rows.map(pt => {
        // Convert Buffer to Base64 string for Frontend
        const imgBuffer = pt.userImage;
        let imageStr = null;
        if (imgBuffer) {
            imageStr = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
        }
        return {
            ...pt,
            userImage: imageStr
        };
    });

    console.log(`📤 Sending ${formatted.length} patients to frontend`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ error: 'Server Error fetching patients' });
  }
});

// 2. REGISTER PATIENT
app.post('/patients/register', async (req, res) => {
  const { fullName, contactNumber, email, userImage, status, dateCreated } = req.body;

  if (!fullName || !email) {
      return res.status(400).json({ error: "Full Name and Email are required." });
  }

  try {
    // Generate Credentials
    const password = generateRandomPassword(10);
    const username = generateRandomUsername(fullName);
    
    // Process Image
    const imageBuffer = userImage ? Buffer.from(userImage, 'base64') : null;
    const patientStatus = status || 'Active';

    // Insert into DB
    const query = `
      INSERT INTO patient_account 
      ("username", "password", "fullName", "contactNumber", "email", "userImage", "status", "dateCreated") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    const values = [username, password, fullName, contactNumber, email, imageBuffer, patientStatus, dateCreated];

    const newPatient = await pool.query(query, values);

    // Send Email via SendGrid
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Welcome to Agsikap - Patient Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome, ${fullName}!</h2>
          <p>Your patient account has been successfully created.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please keep this information safe.</p>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
    }

    res.status(201).json({ message: 'Patient registered successfully', user: newPatient.rows[0] });

  } catch (err) {
    console.error("❌ Patient Reg Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE PATIENT
app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { username, fullName, contactNumber, email, userImage, status } = req.body;

  try {
    let imageBuffer = null;
    
    // Check if image is new (Base64 string) or existing buffer
    if (userImage && typeof userImage === 'string') {
        // If it comes with prefix "data:image...", strip it
        const base64Data = userImage.includes(',') ? userImage.split(',')[1] : userImage;
        imageBuffer = Buffer.from(base64Data, 'base64');
    }

    let query, values;

    if (imageBuffer) {
      // Update WITH image
      query = `
        UPDATE patient_account 
        SET "username"=$1, "fullName"=$2, "contactNumber"=$3, "email"=$4, "status"=$5, "userImage"=$6 
        WHERE pk=$7 RETURNING *
      `;
      values = [username, fullName, contactNumber, email, status, imageBuffer, id];
    } else {
      // Update WITHOUT image (keep existing)
      query = `
        UPDATE patient_account 
        SET "username"=$1, "fullName"=$2, "contactNumber"=$3, "email"=$4, "status"=$5 
        WHERE pk=$6 RETURNING *
      `;
      values = [username, fullName, contactNumber, email, status, id];
    }

    const updated = await pool.query(query, values);
    
    if (updated.rows.length === 0) {
        return res.status(404).json({ error: "Patient not found" });
    }

    console.log(`✅ Patient updated: ${updated.rows[0].username}`);
    res.json({ message: "Updated successfully", user: updated.rows[0] });

  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 3001; 
app.listen(PORT, () => {
  console.log(`🚀 Patient Server running on http://localhost:${PORT}`);
});