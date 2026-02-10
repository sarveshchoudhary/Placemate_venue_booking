const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3002;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// ===== MySQL Pool =====
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MyPassword@123',
  database: 'pm_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ===== Table Setup =====
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100),
        email VARCHAR(100),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue VARCHAR(100),
        name VARCHAR(100),
        email VARCHAR(100),
        booking_date DATE,
        start_time TIME,
        end_time TIME,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        equipment VARCHAR(100),
        name VARCHAR(100),
        email VARCHAR(100),
        booking_date DATE,
        start_time TIME,
        end_time TIME,
        quantity INT,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `);

    console.log('✅ Tables verified/created successfully.');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  }
}

// ===== Wait for Tables to be Ready =====
createTables().then(() => {
  console.log('✅ Database initialized.');
}).catch(err => console.error(err));

// ===== Nodemailer Setup =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===== Signup =====
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    res.status(201).json({ message: 'Signup successful.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ===== Login =====
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Provide email & password.' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    await pool.query(
      'INSERT INTO user_sessions (user_id, name, email, login_time) VALUES (?, ?, ?, NOW())',
      [user.id, user.name, user.email]
    );

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Welcome to Placemate',
        text: `Hello ${user.name}, you have successfully logged in to Placemate.`
      }).catch(err => console.error('Email send error:', err));
    }

    res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ===== Logout =====
app.post('/api/logout', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Provide email.' });

  try {
    const [rows] = await pool.query(
      `SELECT id FROM user_sessions WHERE email = ? AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1`,
      [email]
    );

    if (!rows.length) return res.status(404).json({ message: 'No active session.' });

    await pool.query('UPDATE user_sessions SET logout_time = CURRENT_TIMESTAMP WHERE id = ?', [rows[0].id]);
    res.json({ message: 'Logout recorded.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ===== Venue Bookings =====
app.post('/api/bookings', async (req, res) => {
  const { venue, name, email, bookingDate, startTime, endTime } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO bookings (venue, name, email, booking_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [venue, name, email, bookingDate, startTime, endTime]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Booking insert error:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { email } = req.query;
    const [rows] = await pool.query(email ? 'SELECT * FROM bookings WHERE email = ?' : 'SELECT * FROM bookings', email ? [email] : []);
    res.json(rows);
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/:status', async (req, res) => {
  const { id, status } = req.params;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  try {
    await pool.query('UPDATE bookings SET status=? WHERE id=?', [status, Number(id)]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Delete Venue Booking =====
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (err) {
    console.error('❌ Delete booking error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ===== Equipment Bookings =====
app.post('/api/equipment-bookings', async (req, res) => {
  const { equipment, name, email, bookingDate, startTime, endTime, quantity } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO equipment_bookings (equipment, name, email, booking_date, start_time, end_time, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [equipment, name, email, bookingDate, startTime, endTime, quantity]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Equipment insert error:', err);
    res.status(500).json({ success: false, error: 'DB insert failed.' });
  }
});

app.get('/api/equipment-bookings', async (req, res) => {
  try {
    const { email } = req.query;
    const [rows] = await pool.query(
      email ? 'SELECT * FROM equipment_bookings WHERE email = ?' : 'SELECT * FROM equipment_bookings',
      email ? [email] : []
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch equipment error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipment-bookings/:id/:status', async (req, res) => {
  const { id, status } = req.params;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  try {
    console.log(`🔄 Updating equipment_booking id=${id} to status=${status}`);
    await pool.query('UPDATE equipment_bookings SET status=? WHERE id=?', [status, Number(id)]);
    res.json({ success: true });
  } catch (err) {
    console.error('Equipment status update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/equipment-bookings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM equipment_bookings WHERE id=?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete equipment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Server =====
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
