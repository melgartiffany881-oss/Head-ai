/**
 * AI Adapter — Real OpenAI Integration
 * Falls back to templates if API key is missing or API call fails.
 */

let openai = null;
try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.log('OpenAI not available, using template fallback');
}

async function generateWithAI(systemPrompt, userPrompt, options = {}) {
  if (!openai) return null;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    });
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return null;
  }
}

module.exports = { generateWithAI };