const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'hirestack-dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan, rolesLimit: user.rolesLimit },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function checkPlan(minimumPlan) {
  const tier = ['free', 'starter', 'pro', 'enterprise'];
  const minIdx = tier.indexOf(minimumPlan);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userPlan = req.user.plan || 'free';
    const userIdx = tier.indexOf(userPlan);
    if (userIdx < minIdx) {
      return res.status(403).json({
        error: 'Plan upgrade required',
        detail: `This feature requires at least the "${minimumPlan}" plan. Your plan: "${userPlan}"`
      });
    }
    // Check usage limit for free/starter paid plans with a limit > 0
    if (parseInt(req.user.rolesLimit) > 0) {
      const db = getDb();
      const row = db.prepare(
        "SELECT rolesUsed FROM users WHERE id = ?"
      ).get(req.user.id);
      if (row && row.rolesUsed >= parseInt(req.user.rolesLimit)) {
        return res.status(429).json({
          error: 'Monthly role limit reached',
          detail: `Your plan allows ${req.user.rolesLimit} roles. Upgrade to Pro for unlimited.`
        });
      }
    }
    next();
  };
}

function incrementRolesUsed(userId) {
  const db = getDb();
  db.prepare('UPDATE users SET rolesUsed = rolesUsed + 1 WHERE id = ?').run(userId);
}

module.exports = { generateToken, requireAuth, checkPlan, incrementRolesUsed, JWT_SECRET };