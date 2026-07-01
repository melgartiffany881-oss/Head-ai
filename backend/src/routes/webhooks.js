const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { q } = require('../db/database');

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = webhookSecret && webhookSecret !== 'whsec_placeholder'
      ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      : JSON.parse(req.body.toString());
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        await handleSubscriptionChanged(event.data.object);
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

router.post('/upgrade', express.json(), async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    if (!priceId) return res.status(400).json({ error: 'priceId is required.' });

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return res.json({ message: 'Dev mode — upgrade simulated', checkoutUrl: null });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3001'}/dashboard?upgrade=success`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3001'}/pricing`,
      metadata: { user_id: req.user?.id?.toString() || 'anonymous' }
    });
    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  const tier = session.amount_total >= 7900 ? 'pro' : 'starter';
  await q(
    'UPDATE users SET subscription_tier = $1, stripe_customer_id = $2, subscription_status = $3, updated_at = NOW() WHERE id = $4',
    [tier, session.customer, 'active', userId]
  );
  await q(
    'INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, tier, status) VALUES ($1, $2, $3, $4, $5)',
    [userId, session.subscription, session.customer, tier, 'active']
  );
}

async function handleSubscriptionChanged(subscription) {
  const status = subscription.status === 'active' ? 'active'
    : subscription.status === 'canceled' ? 'canceled'
    : 'unknown';
  await q('UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2', [status, subscription.id]);
  const subs = await q('SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1', [subscription.id]);
  if (subs.length > 0) {
    await q('UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2', [status, subs[0].user_id]);
  }
}

module.exports = router;