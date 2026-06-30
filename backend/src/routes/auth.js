const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, uuid } = require('../db/database');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const id = uuid();
    db.prepare(
      'INSERT INTO users (id, email, password, name, plan, rolesUsed, rolesLimit) VALUES (?, ?, ?, ?, ?, 0, 0)'
    ).run(id, email.toLowerCase(), hash, name, 'free');

    const user = db.prepare('SELECT id, email, name, plan, rolesUsed, rolesLimit, createdAt FROM users WHERE id = ?').get(id);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const safe = { id: user.id, email: user.email, name: user.name, plan: user.plan, rolesUsed: user.rolesUsed, rolesLimit: user.rolesLimit, createdAt: user.createdAt };
    const token = generateToken(safe);
    res.json({ user: safe, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, plan, rolesUsed, rolesLimit, stripeCustomerId, createdAt FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;