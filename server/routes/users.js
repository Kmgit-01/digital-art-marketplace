const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../db');

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const pool = await getPool();
    const result = await pool.request()
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('role', sql.NVarChar, role || 'buyer')
      .query(`
        INSERT INTO Users (FullName, Email, PasswordHash, Role)
        OUTPUT INSERTED.UserId
        VALUES (@fullName, @email, @passwordHash, @role)
      `);

    res.status(201).json({ userId: result.recordset[0].UserId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.UserId, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { userId: user.UserId, fullName: user.FullName, role: user.Role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
