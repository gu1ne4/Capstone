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

// Test database connections
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

// ========== SIMPLIFIED ROUTES ==========

// SAVE/UPDATE day availability (UPDATED VERSION)
app.post('/api/availability/day', async (req, res) => {
  const { vet_id, day_of_week, pk_id, is_available } = req.body;
  console.log(`📅 Update day: vet_id=${vet_id}, day_of_week=${day_of_week}, pk_id=${pk_id}, is_available=${is_available}`);
  
  try {
    let actualDayOfWeek = day_of_week;
    
    // If pk_id is provided, use it to determine day_of_week
    if (pk_id && !day_of_week) {
      const dayMap = {
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
        7: 'sunday'
      };
      actualDayOfWeek = dayMap[pk_id];
      
      if (!actualDayOfWeek) {
        return res.status(400).json({ error: 'Invalid PK ID' });
      }
    }
    
    // Simple upsert using ON CONFLICT with the unique constraint
    const result = await pool.query(
      `INSERT INTO vet_availability_settings 
       (vet_id, setting_type, day_of_week, is_available)
       VALUES ($1, 'day_availability', $2, $3)
       ON CONFLICT (vet_id, setting_type, day_of_week) 
       DO UPDATE SET 
         is_available = EXCLUDED.is_available,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [vet_id, actualDayOfWeek, is_available]
    );
    
    console.log(`✅ Day ${actualDayOfWeek} updated to ${is_available ? 'available' : 'unavailable'}`);
    
    res.json({ 
      message: 'Day availability saved', 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ Save day availability error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// SAVE time slots
app.post('/api/availability/time-slots', async (req, res) => {
  const { vet_id, day_of_week, slots } = req.body;
  
  try {
    await pool.query('BEGIN');
    
    // Delete existing time slots for this vet and day
    await pool.query(
      `DELETE FROM vet_availability_settings 
       WHERE vet_id = $1 
       AND setting_type = 'time_slot' 
       AND day_of_week = $2`,
      [vet_id, day_of_week]
    );
    
    // Insert new time slots
    for (const slot of slots) {
      await pool.query(
        `INSERT INTO vet_availability_settings 
         (vet_id, setting_type, day_of_week, start_time, end_time, slot_capacity)
         VALUES ($1, 'time_slot', $2, $3, $4, $5)`,
        [vet_id, day_of_week, slot.startTime, slot.endTime, slot.capacity || 1]
      );
    }
    
    await pool.query('COMMIT');
    res.json({ 
      message: 'Time slots saved successfully',
      count: slots.length
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("❌ Save time slots error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// SAVE special date
app.post('/api/availability/special-dates', async (req, res) => {
  const { vet_id, event_name, event_date, is_holiday } = req.body;
  
  try {
    // Check if it already exists
    const checkResult = await pool.query(
      `SELECT id FROM vet_availability_settings 
       WHERE vet_id = $1 
       AND setting_type = 'special_date' 
       AND event_date = $2`,
      [vet_id, event_date]
    );
    
    if (checkResult.rows.length > 0) {
      // Update existing
      const updateResult = await pool.query(
        `UPDATE vet_availability_settings 
         SET event_name = $1, is_holiday = $2, updated_at = CURRENT_TIMESTAMP
         WHERE vet_id = $3 
         AND setting_type = 'special_date' 
         AND event_date = $4
         RETURNING *`,
        [event_name, is_holiday || false, vet_id, event_date]
      );
      
      res.json({ 
        message: 'Special date updated', 
        event: updateResult.rows[0] 
      });
    } else {
      // Insert new
      const insertResult = await pool.query(
        `INSERT INTO vet_availability_settings 
         (vet_id, setting_type, event_name, event_date, is_holiday)
         VALUES ($1, 'special_date', $2, $3, $4)
         RETURNING *`,
        [vet_id, event_name, event_date, is_holiday || false]
      );
      
      res.json({ 
        message: 'Special date saved', 
        event: insertResult.rows[0] 
      });
    }
  } catch (err) {
    console.error("❌ Save special date error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET all availability settings for a vet
app.get('/api/availability/:vetId', async (req, res) => {
  const { vetId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM vet_availability_settings 
       WHERE vet_id = $1 
       ORDER BY setting_type, day_of_week, start_time`,
      [vetId]
    );
    
    // Initialize with default values
    const organizedData = {
      day_availability: [
        { day_of_week: 'sunday', is_available: false },
        { day_of_week: 'monday', is_available: false },
        { day_of_week: 'tuesday', is_available: false },
        { day_of_week: 'wednesday', is_available: false },
        { day_of_week: 'thursday', is_available: false },
        { day_of_week: 'friday', is_available: false },
        { day_of_week: 'saturday', is_available: false }
      ],
      time_slots: [],
      special_dates: []
    };
    
    // Update with database values
    result.rows.forEach(row => {
      if (row.setting_type === 'day_availability') {
        const dayIndex = organizedData.day_availability.findIndex(
          d => d.day_of_week === row.day_of_week
        );
        if (dayIndex !== -1) {
          organizedData.day_availability[dayIndex].is_available = row.is_available;
        }
      } else if (row.setting_type === 'time_slot') {
        organizedData.time_slots.push({
          day_of_week: row.day_of_week,
          start_time: row.start_time,
          end_time: row.end_time,
          capacity: row.slot_capacity
        });
      } else if (row.setting_type === 'special_date') {
        organizedData.special_dates.push({
          event_name: row.event_name,
          event_date: row.event_date,
          is_holiday: row.is_holiday
        });
      }
    });
    
    res.json(organizedData);
    
  } catch (err) {
    console.error("❌ Get availability error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== GET time slots for a specific day ==========
app.get('/api/availability/time-slots/:vetId/:day', async (req, res) => {
  const { vetId, day } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM vet_availability_settings 
       WHERE vet_id = $1 
       AND setting_type = 'time_slot' 
       AND day_of_week = $2
       ORDER BY start_time`,
      [vetId, day]
    );
    
    res.json({ 
      timeSlots: result.rows.map(row => ({
        id: row.id,
        start_time: row.start_time,
        end_time: row.end_time,
        capacity: row.slot_capacity
      }))
    });
  } catch (err) {
    console.error("❌ Get time slots error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== DELETE a specific time slot ==========
app.delete('/api/availability/time-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  
  try {
    const result = await pool.query(
      `DELETE FROM vet_availability_settings 
       WHERE id = $1 
       AND setting_type = 'time_slot'
       RETURNING *`,
      [slotId]
    );
    
    res.json({ 
      message: 'Time slot deleted',
      deleted: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Delete time slot error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const bookedAppointments = {};

// GET booked slots for a specific time slot
app.get('/api/appointments/booked-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  
  try {
    // In a real app, you would query the database
    // For now, we'll use the in-memory store
    const bookedCount = bookedAppointments[slotId] || 0;
    
    res.json({ 
      slotId, 
      bookedCount 
    });
  } catch (err) {
    console.error("❌ Get booked slots error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/appointments', async (req, res) => {
  const { 
    patientName, 
    patientEmail, 
    patientPhone,
    petName,
    petType,
    petGender,
    appointmentType,
    selectedDate,
    timeSlotId,
    timeSlotDisplay,
    doctorId = null
  } = req.body;

  console.log("📅 Creating appointment:", {
    patientName,
    selectedDate,
    timeSlotId,
    petGender
  });

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Check if time slot exists and get its capacity WITH FOR UPDATE (lock the row)
    const slotResult = await pool.query(
      `SELECT * FROM vet_availability_settings 
       WHERE id = $1 AND setting_type = 'time_slot'
       FOR UPDATE`,  // Locks the row to prevent concurrent booking
      [timeSlotId]
    );

    if (slotResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot not found' });
    }

    const slot = slotResult.rows[0];
    const capacity = slot.slot_capacity || 1;
    const currentBookings = slot.current_bookings || 0;

    // 2. Check if there's available capacity
    if (currentBookings >= capacity) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Time slot is fully booked',
        capacity,
        currentBookings,
        availableSlots: 0
      });
    }

    // 3. Increment the current_bookings count
    await pool.query(
      `UPDATE vet_availability_settings 
       SET current_bookings = current_bookings + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [timeSlotId]
    );

    // 4. Create the appointment
    const appointmentQuery = `
      INSERT INTO appointments 
      (patient_name, patient_email, patient_phone, pet_name, pet_type, pet_gender,
       appointment_type, appointment_date, time_slot_id, time_slot_display, doctor_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'scheduled')
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
      selectedDate,
      timeSlotId,
      timeSlotDisplay,
      doctorId
    ];

    const newAppointment = await pool.query(appointmentQuery, appointmentValues);
    
    // Commit transaction
    await pool.query('COMMIT');

    console.log(`✅ Appointment created for ${patientName}`);
    console.log(`   Date: ${selectedDate}`);
    console.log(`   Time: ${timeSlotDisplay}`);
    console.log(`   Available slots: ${capacity - currentBookings - 1}`);

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

// ========== APPOINTMENT MANAGEMENT ROUTES ==========

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await pool.query(`
      SELECT 
        a.*,
        v.day_of_week,
        v.start_time,
        v.end_time,
        v.slot_capacity
      FROM appointments a
      LEFT JOIN vet_availability_settings v ON a.time_slot_id = v.id
      ORDER BY a.appointment_date DESC, a.time_slot_display
    `);
    
    res.json({ appointments: appointments.rows });
  } catch (err) {
    console.error("❌ Get appointments error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments/table', async (req, res) => {
  try {
    console.log("📋 Fetching appointments for table...");
    
    const appointments = await pool.query(`
      SELECT 
        a.id,
        a.patient_name as "name",
        a.appointment_type as "service",
        CONCAT(
          TO_CHAR(a.appointment_date, 'Mon DD, YYYY'), 
          ' - ', 
          a.time_slot_display
        ) as "date_time",
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN ac."fullName"
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

// UPDATE: Count booked slots for a time slot on a specific date
app.get('/api/appointments/booked-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { date } = req.query;
  
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as booked_count 
       FROM appointments 
       WHERE time_slot_id = $1 
         AND appointment_date = $2 
         AND status != 'cancelled'`,
      [slotId, date]
    );
    
    const bookedCount = parseInt(result.rows[0].booked_count) || 0;
    
    res.json({ 
      slotId, 
      date,
      bookedCount 
    });
  } catch (err) {
    console.error("❌ Get booked slots error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Add doctor_id column to appointments table if not exists
app.get('/api/appointments/check-columns', async (req, res) => {
  try {
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
    }
    
    res.json({ 
      message: 'Columns checked/added successfully',
      has_doctor_id: true,
      has_pet_gender: true
    });
  } catch (err) {
    console.error("❌ Check columns error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add this route to check/add missing columns to appointments table
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

app.get('/api/appointments/booked-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { date } = req.query;
  
  try {
    // Get slot capacity and current bookings
    const result = await pool.query(
      `SELECT 
        slot_capacity as capacity,
        current_bookings as booked_count
       FROM vet_availability_settings 
       WHERE id = $1 AND setting_type = 'time_slot'`,
      [slotId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    
    const slot = result.rows[0];
    const bookedCount = slot.booked_count || 0;
    const capacity = slot.capacity || 1;
    
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

app.put('/api/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('BEGIN');
    
    // 1. Get appointment details including time_slot_id
    const appointmentResult = await pool.query(
      `SELECT time_slot_id, status FROM appointments WHERE id = $1`,
      [id]
    );
    
    if (appointmentResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = appointmentResult.rows[0];
    
    if (appointment.status === 'cancelled') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }
    
    // 2. Decrement current_bookings for the time slot
    if (appointment.time_slot_id) {
      await pool.query(
        `UPDATE vet_availability_settings 
         SET current_bookings = GREATEST(0, current_bookings - 1),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [appointment.time_slot_id]
      );
    }
    
    // 3. Update appointment status to cancelled
    const updateResult = await pool.query(
      `UPDATE appointments 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    await pool.query('COMMIT');
    
    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment: updateResult.rows[0]
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("❌ Cancel appointment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Reset current_bookings at the start of each day (run as a cron job)
app.post('/api/availability/reset-bookings', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE vet_availability_settings 
       SET current_bookings = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE setting_type = 'time_slot'
       AND DATE(updated_at) < CURRENT_DATE`
    );
    
    res.json({ 
      message: 'Bookings reset successfully',
      rowsUpdated: result.rowCount
    });
    
  } catch (err) {
    console.error("❌ Reset bookings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

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
      'SELECT "fullName" FROM accounts WHERE pk = $1',
      [doctorId]
    );
    
    const doctorName = doctorResult.rows.length > 0 
      ? doctorResult.rows[0].fullName 
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

// ========== UPDATE DAY AVAILABILITY BY PK ID ==========
app.put('/api/availability/day-by-pk', async (req, res) => {
  const { vet_id, pk_id, is_available } = req.body;
  console.log(`📅 Update day by PK: vet_id=${vet_id}, pk_id=${pk_id}, is_available=${is_available}`);
  
  try {
    // Map PK ID to day name
    const dayMap = {
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
      7: 'sunday'
    };
    
    const day_of_week = dayMap[pk_id];
    
    if (!day_of_week) {
      return res.status(400).json({ error: 'Invalid PK ID' });
    }
    
    // Simple upsert using ON CONFLICT with the unique constraint
    const result = await pool.query(
      `INSERT INTO vet_availability_settings 
       (vet_id, setting_type, day_of_week, is_available)
       VALUES ($1, 'day_availability', $2, $3)
       ON CONFLICT (vet_id, setting_type, day_of_week) 
       DO UPDATE SET 
         is_available = EXCLUDED.is_available,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [vet_id, day_of_week, is_available]
    );
    
    console.log(`✅ Day ${day_of_week} (PK: ${pk_id}) updated to ${is_available ? 'available' : 'unavailable'}`);
    
    res.json({ 
      message: 'Day availability saved', 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ Save day availability error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});