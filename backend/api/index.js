const express = require('express');
const cors = require('cors');
const apiRoutes = require('../src/routes/api');
const authRoutes = require('../src/routes/auth');
const webhookRoutes = require('../src/routes/webhooks');
const { getDb } = require('../src/db/database');

const app = express();

// Middleware
app.use(cors());

// Stripe webhook route MUST be registered BEFORE global express.json()
app.use('/api/webhooks', webhookRoutes);

// Subscription upgrade/portal routes (also from webhooks.js)
app.use('/api/subscription', webhookRoutes);

// For all other routes, parse JSON body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/api/auth', authRoutes);

// Existing API routes (recruiting generators)
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'HireStack AI Backend',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      usage: 'GET /api/auth/usage',
      upgrade: 'POST /api/subscription/upgrade',
      portal: 'POST /api/subscription/portal',
      webhook: 'POST /api/webhooks/stripe',
      generateJd: 'POST /api/generate-jd',
      generateBooleanSearch: 'POST /api/generate-boolean-search',
      generateQuestions: 'POST /api/generate-questions',
      generateScorecard: 'POST /api/generate-scorecard',
      generateEmail: 'POST /api/generate-email',
      generateOfferLetter: 'POST /api/generate-offer-letter',
      analyzeResume: 'POST /api/analyze-resume',
      atsOptimize: 'POST /api/ats-optimize'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;