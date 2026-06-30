/**
 * Auth Routes — Register, Login, and Profile
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Creates a new user account.
 * Body: { email, password, name, company? }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const db = getDb();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name, company, subscription_tier, subscription_status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      email.toLowerCase(),
      passwordHash,
      name.trim(),
      company || '',
      'starter',  // default tier
      'active'    // active by default (trial)
    );

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/auth/profile
 * Returns the authenticated user's profile.
 */
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, company, subscription_tier, subscription_status, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user });
});

/**
 * GET /api/auth/usage
 * Returns usage stats for the authenticated user.
 */
router.get('/usage', authenticateToken, (req, res) => {
  const db = getDb();

  const currentMonth = db.prepare(
    "SELECT COUNT(*) as count FROM usage_log WHERE user_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
  ).get(req.user.id);

  const totalUsage = db.prepare(
    'SELECT COUNT(*) as count FROM usage_log WHERE user_id = ?'
  ).get(req.user.id);

  res.json({
    currentMonthRoles: currentMonth.count,
    totalApiCalls: totalUsage.count,
    plan: req.user.subscription_tier,
    limit: req.user.subscription_tier === 'starter' ? 10 : 'unlimited'
  });
});

module.exports = router;