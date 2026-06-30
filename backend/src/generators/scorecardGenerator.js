/**
 * Scorecard Generator
 * Generates structured candidate evaluation scorecards.
 */

class ScorecardGenerator {
  static generate(data) {
    const { role, criteria, scale } = data;
    const ratingScale = scale || '1-5';

    const defaultCriteria = [
      { name: 'Technical Skills', weight: 25, desc: `Depth and breadth of technical expertise relevant to the ${role} role` },
      { name: 'Experience & Background', weight: 15, desc: 'Relevance and quality of prior work experience' },
      { name: 'Problem Solving', weight: 20, desc: 'Ability to analyze complex problems and develop effective solutions' },
      { name: 'Communication', weight: 15, desc: 'Clarity in explaining ideas, active listening, and written communication' },
      { name: 'Cultural Fit', weight: 10, desc: 'Alignment with company values and team dynamics' },
      { name: 'Leadership & Initiative', weight: 10, desc: 'Demonstrated ownership, proactivity, and ability to influence' },
      { name: 'Growth Potential', weight: 5, desc: 'Capacity and desire to learn and grow beyond current role' }
    ];

    let customCriteria = [];
    if (criteria && typeof criteria === 'string') {
      customCriteria = criteria.split(',').map(c => c.trim()).filter(Boolean);
    }

    const allCriteria = customCriteria.length > 0
      ? customCriteria.map((c, i) => ({
          criteria: c,
          weight: Math.round(100 / customCriteria.length),
          description: `Evaluation of ${c.toLowerCase()} for the ${role} position`
        }))
      : defaultCriteria.map(c => ({
          criteria: c.name,
          weight: c.weight,
          description: c.desc
        }));

    return {
      scorecard: allCriteria,
      scale: ratingScale,
      instructions: `Rate each criterion on a ${ratingScale} scale. Provide specific examples and comments for each rating. Total possible score: 100.`
    };
  }
}

module.exports = ScorecardGenerator;