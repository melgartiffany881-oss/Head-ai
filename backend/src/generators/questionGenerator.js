/**
 * Interview Question Generator
 * Generates tailored technical, behavioral, and situational interview questions.
 */

class QuestionGenerator {
  static generate(data) {
    const { role, seniority, skills, questionTypes } = data;

    const skillsList = (skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const seniorityLevel = seniority || 'mid-level';
    const types = questionTypes || ['technical', 'behavioral', 'situational'];

    const result = {};

    if (types.includes('technical')) {
      result.technical = this._generateTechnical(role, seniorityLevel, skillsList);
    }

    if (types.includes('behavioral')) {
      result.behavioral = this._generateBehavioral(role, seniorityLevel);
    }

    if (types.includes('situational')) {
      result.situational = this._generateSituational(role, seniorityLevel);
    }

    return result;
  }

  static _generateTechnical(role, seniority, skills) {
    const questions = [];

    if (skills.length > 0) {
      skills.forEach(skill => {
        questions.push(`Describe your experience with ${skill}. What projects have you used it on and what was your specific contribution?`);
        questions.push(`What are the most common pitfalls when working with ${skill}, and how do you avoid them?`);
        if (seniority.toLowerCase().includes('senior') || seniority.toLowerCase().includes('lead')) {
          questions.push(`How would you design a scalable system using ${skill}? Walk us through your architectural decisions.`);
        }
      });
    }

    // Add role-specific technical questions
    if (role.toLowerCase().includes('engineer') || role.toLowerCase().includes('developer')) {
      questions.push('Explain a time when you had to debug a complex production issue. What was your approach?');
      questions.push('How do you approach code reviews? What do you look for?');
      if (seniority.toLowerCase().includes('senior') || seniority.toLowerCase().includes('lead')) {
        questions.push('How do you balance technical debt with feature delivery?');
        questions.push('Describe your experience with system design and architecture decisions.');
      }
    }

    if (role.toLowerCase().includes('data')) {
      questions.push('Explain your process for data cleaning and validation.');
      questions.push('How do you ensure reproducibility in your analysis?');
    }

    if (role.toLowerCase().includes('product') || role.toLowerCase().includes('manager')) {
      questions.push('How do you prioritize features in a roadmap? Describe your framework.');
      questions.push('Walk me through how you would launch a new product feature from ideation to delivery.');
    }

    if (role.toLowerCase().includes('design')) {
      questions.push('Walk us through your design process from research to final delivery.');
      questions.push('How do you incorporate user feedback into your designs?');
    }

    // Add general technical questions if we don't have enough
    if (questions.length < 3) {
      questions.push(`What technical skills make you effective as a ${role}?`);
      questions.push('How do you stay current with industry trends and tools?');
      questions.push('Describe a technical challenge you overcame and what you learned.');
    }

    return questions.slice(0, 6);
  }

  static _generateBehavioral(role, seniority) {
    return [
      'Tell me about a time you had to collaborate with a difficult stakeholder. How did you handle it?',
      'Describe a situation where you had to adapt to a significant change at work. How did you manage?',
      'Tell me about a time you took initiative beyond your defined responsibilities.',
      'Describe a project that failed or didn\'t meet expectations. What did you learn from it?',
      'How do you handle receiving critical feedback? Give a specific example.',
      'Tell me about a time you helped a teammate succeed. What did you do?'
    ];
  }

  static _generateSituational(role, seniority) {
    const isSenior = seniority.toLowerCase().includes('senior') || seniority.toLowerCase().includes('lead');

    const questions = [
      `You're given a tight deadline for a critical ${role} project with unclear requirements. What steps do you take?`,
      `A team member disagrees with your technical approach on a key initiative. How do you resolve this?`,
      `You discover a major flaw in a project that's already been approved by leadership. What do you do?`
    ];

    if (isSenior) {
      questions.push('You notice your team is burning out from an aggressive roadmap. How do you address this with leadership?');
      questions.push('Two senior team members have opposing architectural visions. How do you facilitate a decision?');
    }

    questions.push('A project you\'re leading falls behind schedule. How do you get it back on track?');

    return questions;
  }
}

module.exports = QuestionGenerator;