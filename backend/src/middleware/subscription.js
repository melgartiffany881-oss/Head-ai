const { q } = require('../db/database');

const TIER_ORDER = ['starter', 'pro', 'enterprise'];

function tierMeetsOrExceeds(tierA, tierB) {
  const idxA = TIER_ORDER.indexOf(tierA);
  const idxB = TIER_ORDER.indexOf(tierB);
  if (idxA === -1) return false;
  if (idxB === -1) return true;
  return idxA >= idxB;
}

function requireSubscription(minimumTier = 'starter') {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    const { subscription_tier, subscription_status } = req.user;
    if (subscription_status !== 'active') {
      return res.status(403).json({ error: 'Subscription is not active.', detail: `Status: "${subscription_status}"` });
    }
    if (!tierMeetsOrExceeds(subscription_tier, minimumTier)) {
      return res.status(403).json({ error: 'Upgrade required.', detail: `This feature requires "${minimumTier}" plan. Current: "${subscription_tier}".` });
    }
    next();
  };
}

function checkUsageLimit() {
  return async (req, res, next) => {
    if (!req.user || req.user.subscription_tier !== 'starter') return next();
    try {
      const result = await q(
        "SELECT COUNT(*) as cnt FROM usage_log WHERE user_id = $1 AND date_trunc('month', created_at) = date_trunc('month', NOW())",
        [req.user.id]
      );
      if (parseInt(result[0]?.cnt || 0) >= 10) {
        return res.status(429).json({ error: 'Monthly role limit reached (10/10). Upgrade to Pro for unlimited usage.' });
      }
      next();
    } catch (err) {
      console.error('Usage check error:', err);
      next();
    }
  };
}

async function logUsage(userId, endpoint) {
  try { await q('INSERT INTO usage_log (user_id, endpoint) VALUES ($1, $2)', [userId, endpoint]); }
  catch (err) { console.error('Usage log error:', err); }
}

module.exports = { requireSubscription, checkUsageLimit, logUsage };