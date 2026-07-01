const express = require('express');
const bcrypt = require('bcryptjs');
const { q } = require('../db/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await q('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await q(
      `INSERT INTO users (email, password_hash, name, company, subscription_tier, subscription_status)
       VALUES ($1, $2, $3, $4, 'starter', 'active')
       RETURNING id, email, name, company, subscription_tier, subscription_status, created_at`,
      [email.toLowerCase(), passwordHash, name.trim(), company || '']
    );

    const user = result[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, name: user.name, company: user.company, subscription_tier: user.subscription_tier, subscription_status: user.subscription_status },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await q('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = users[0];

    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, company: user.company, subscription_tier: user.subscription_tier, subscription_status: user.subscription_status },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await q('SELECT id, email, name, company, subscription_tier, subscription_status, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const usage = await q(
      "SELECT COUNT(*) as count FROM usage_log WHERE user_id = $1 AND date_trunc('month', created_at) = date_trunc('month', NOW())",
      [req.user.id]
    );
    const total = await q('SELECT COUNT(*) as count FROM usage_log WHERE user_id = $1', [req.user.id]);

    res.json({
      currentMonthRoles: parseInt(usage[0]?.count || 0),
      totalApiCalls: parseInt(total[0]?.count || 0),
      plan: req.user.subscription_tier,
      limit: req.user.subscription_tier === 'starter' ? 10 : 'unlimited'
    });
  } catch (err) {
    console.error('Usage error:', err);
    res.status(500).json({ error: 'Failed to fetch usage stats.' });
  }
});

module.exports = router;