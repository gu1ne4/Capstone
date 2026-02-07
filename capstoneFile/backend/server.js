const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hospital', 
  password: 'mags012224',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) return console.error('Error acquiring client', err.stack);
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) return console.error('Error executing query', err.stack);
    console.log('✅ Connected to PostgreSQL (hospital db) successfully');
  });
});

// === REGISTER ROUTE (UPDATED FOR DATE) ===
app.post('/register', async (req, res) => {
  console.log("📥 Registration request received");

  const { 
    username, password, fullName, contactNumber, email, 
    role, department, employeeID, userImage, status, dateCreated // <--- New Field
  } = req.body;

  try {
    const imageBuffer = userImage ? Buffer.from(userImage, 'base64') : null;
    const userStatus = status || 'Active'; 

    // Added "dateCreated" to the query
    const query = `
      INSERT INTO accounts 
      ("username", "password", "fullName", "contactNumber", "email", "role", "department", "employeeID", "userImage", "status", "dateCreated") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `;

    const values = [
      username, password, fullName, contactNumber, email, 
      role, department, employeeID, imageBuffer, userStatus, dateCreated
    ];

    const newAccount = await pool.query(query, values);
    
    res.status(201).json({ 
        message: 'Registered successfully', 
        user: { pk: newAccount.rows[0].pk, username: newAccount.rows[0].username } 
    });

  } catch (err) {
    console.error("❌ Database error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// === LOGIN ROUTE ===
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = result.rows[0];

    if (user.status === 'Disabled' || user.status === 'Inactive') {
        return res.status(403).json({ error: 'Account is disabled.' });
    }

    if (user.password === password) {
      res.json({ message: 'Login successful', user: { id: user.pk, username: user.username } });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// === GET ALL ACCOUNTS ===
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

// === UPDATE ACCOUNT ===
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

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});