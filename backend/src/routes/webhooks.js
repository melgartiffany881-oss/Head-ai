/**
 * Stripe Webhook Routes (async for Neon Postgres)
 */
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { getDb } = require('../db/database');

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (webhookSecret && webhookSecret !== 'whsec_placeholder') {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
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
      return res.json({
        message: 'Dev mode — upgrade simulated',
        checkoutUrl: null,
        devInstructions: 'Set STRIPE_SECRET_KEY env var to enable real Stripe.'
      });
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
    console.error('Upgrade error:', err);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

router.post('/portal', express.json(), async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return res.json({ message: 'Dev mode — portal not available', portalUrl: null });
    }
    const { customerId, returnUrl } = req.body;
    if (!customerId) return res.status(400).json({ error: 'customerId is required.' });
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin || 'http://localhost:3001'}/dashboard`,
    });
    res.json({ portalUrl: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session.' });
  }
});

// --- Webhook handlers ---

async function handleCheckoutCompleted(session) {
  const db = getDb();
  const userId = session.metadata?.user_id;
  if (!userId) return;

  const tier = determineTierFromPrice(session.amount_total);
  const customerId = session.customer;
  const now = new Date(session.created * 1000).toISOString();
  const periodEnd = new Date((session.created + 2592000) * 1000).toISOString();

  await db`
    UPDATE users SET
      subscription_tier = ${tier},
      stripe_customer_id = ${customerId},
      subscription_status = 'active',
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  await db`
    INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, tier, status, current_period_start, current_period_end)
    VALUES (${userId}, ${session.subscription}, ${customerId}, ${tier}, 'active', ${now}, ${periodEnd})
  `;
}

async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;
  const db = getDb();
  const subs = await db`SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ${invoice.subscription}`;
  if (subs.length > 0) {
    const periodEnd = invoice.lines?.data?.[0]?.period?.end;
    if (periodEnd) {
      await db`UPDATE subscriptions SET status = 'active', current_period_end = ${new Date(periodEnd * 1000).toISOString()}, updated_at = NOW() WHERE stripe_subscription_id = ${invoice.subscription}`;
    }
  }
}

async function handleSubscriptionChanged(subscription) {
  const db = getDb();
  const status = subscription.status === 'active' ? 'active'
    : subscription.status === 'past_due' ? 'past_due'
    : subscription.status === 'canceled' ? 'canceled'
    : 'unknown';

  await db`
    UPDATE subscriptions SET status = ${status}, current_period_end = ${new Date(subscription.current_period_end * 1000).toISOString()}, updated_at = NOW()
    WHERE stripe_subscription_id = ${subscription.id}
  `;

  const subs = await db`SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id}`;
  if (subs.length > 0) {
    await db`UPDATE users SET subscription_status = ${status}, updated_at = NOW() WHERE id = ${subs[0].user_id}`;
  }
}

function determineTierFromPrice(amountTotal) {
  if (!amountTotal) return 'starter';
  if (amountTotal >= 7900) return 'pro';
  if (amountTotal >= 2900) return 'starter';
  return 'starter';
}

module.exports = router;