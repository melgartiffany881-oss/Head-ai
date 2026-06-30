const express = require('express');
const router = express.Router();

const JDGenerator = require('../generators/jdGenerator');
const BooleanSearchGenerator = require('../generators/booleanSearchGenerator');
const QuestionGenerator = require('../generators/questionGenerator');
const ScorecardGenerator = require('../generators/scorecardGenerator');
const EmailGenerator = require('../generators/emailGenerator');
const OfferLetterGenerator = require('../generators/offerLetterGenerator');
const ResumeAnalyzer = require('../generators/resumeAnalyzer');
const ATSOptimizer = require('../generators/atsOptimizer');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'HireStack AI Backend', version: '1.0.0' });
});

// 1. Job Description Generator
router.post('/generate-jd', async (req, res) => {
  try {
    const { title, seniority, industry, companyCulture, keyResponsibilities, requirements } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await JDGenerator.generate({ title, seniority, industry, companyCulture, keyResponsibilities, requirements });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Boolean Search Generator
router.post('/generate-boolean-search', (req, res) => {
  try {
    const { role, requiredSkills, preferredSkills, location, experienceLevel } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const result = BooleanSearchGenerator.generate({ role, requiredSkills, preferredSkills, location, experienceLevel });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Interview Question Generator
router.post('/generate-questions', (req, res) => {
  try {
    const { role, seniority, skills, questionTypes } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const result = QuestionGenerator.generate({ role, seniority, skills, questionTypes });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Scorecard Generator
router.post('/generate-scorecard', (req, res) => {
  try {
    const { role, criteria, scale } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const result = ScorecardGenerator.generate({ role, criteria, scale });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Outreach Email Generator
router.post('/generate-email', (req, res) => {
  try {
    const { candidateName, candidateRole, companyName, yourRole, tone, keyPoints } = req.body;
    if (!candidateName || !candidateRole) return res.status(400).json({ error: 'candidateName and candidateRole are required' });
    const result = EmailGenerator.generate({ candidateName, candidateRole, companyName, yourRole, tone, keyPoints });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Offer Letter Generator
router.post('/generate-offer-letter', (req, res) => {
  try {
    const { candidateName, role, companyName, startDate, salary, equity, benefits, location } = req.body;
    if (!candidateName || !role) return res.status(400).json({ error: 'candidateName and role are required' });
    const result = OfferLetterGenerator.generate({ candidateName, role, companyName, startDate, salary, equity, benefits, location });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Resume Analyzer
router.post('/analyze-resume', (req, res) => {
  try {
    const { resumeText, role } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'resumeText is required' });
    const result = ResumeAnalyzer.analyze({ resumeText, role });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ATS Optimizer
router.post('/ats-optimize', (req, res) => {
  try {
    const { jdText, resumeText } = req.body;
    if (!jdText || !resumeText) return res.status(400).json({ error: 'jdText and resumeText are required' });
    const result = ATSOptimizer.optimize({ jdText, resumeText });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;