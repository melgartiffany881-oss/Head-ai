const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'HireStack AI Backend',
    version: '1.0.0',
    endpoints: {
      generateJd: 'POST /api/generate-jd',
      generateBooleanSearch: 'POST /api/generate-boolean-search',
      generateQuestions: 'POST /api/generate-questions',
      generateScorecard: 'POST /api/generate-scorecard',
      generateEmail: 'POST /api/generate-email',
      generateOfferLetter: 'POST /api/generate-offer-letter',
      analyzeResume: 'POST /api/analyze-resume',
      atsOptimize: 'POST /api/ats-optimize',
      health: 'GET /api/health'
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HireStack AI Backend running on http://0.0.0.0:${PORT}`);
});

module.exports = app;