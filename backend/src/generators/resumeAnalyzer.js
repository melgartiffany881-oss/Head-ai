/**
 * Resume Analyzer
 * Parses resume text and provides structured analysis, strengths, improvements, and match scores.
 */

class ResumeAnalyzer {
  static analyze(data) {
    const { resumeText, role } = data;

    if (!resumeText || resumeText.trim().length === 0) {
      return {
        summary: { error: 'No resume text provided' },
        strengths: [],
        improvements: [],
        matchScore: 0
      };
    }

    const text = resumeText;

    // Extract basic info
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);

    // Extract skills (common tech skills)
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Ruby', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node', 'Express', 'Django', 'Flask', 'Spring',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
      'SQL', 'NoSQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
      'Machine Learning', 'AI', 'Data Science', 'NLP', 'Computer Vision',
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Git', 'REST API', 'GraphQL',
      'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
      'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
      'Product Management', 'A/B Testing', 'Analytics', 'User Research'
    ];

    const foundSkills = commonSkills.filter(skill => {
      const regex = new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return regex.test(text);
    });

    // Count years of experience
    const yearMatches = text.match(/\b(20\d{2})\b/g);
    const years = yearMatches ? yearMatches.map(Number) : [];
    const yearsOfExp = years.length > 0
      ? Math.max(...years) - Math.min(...years)
      : 0;

    // Detect education level
    const hasPhD = /ph\.?d|doctorate/i.test(text);
    const hasMasters = /master|m\.?s\.?|mba/i.test(text);
    const hasBachelors = /bachelor|b\.?s\.?|b\.?a\.?/i.test(text);
    let education = 'Not specified';
    if (hasPhD) education = 'PhD';
    else if (hasMasters) education = 'Master\'s degree';
    else if (hasBachelors) education = 'Bachelor\'s degree';

    // Build summary
    const summary = {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      linkedin: linkedinMatch ? linkedinMatch[0] : null,
      skills: foundSkills,
      skillCount: foundSkills.length,
      estimatedExperience: `${yearsOfExp}+ years`,
      education,
      roleFit: role ? this._calculateFit(role, foundSkills) : null
    };

    // Strengths
    const strengths = [];
    if (foundSkills.length >= 5) {
      strengths.push(`Strong technical skill set with expertise in ${foundSkills.length} key areas`);
    }
    if (yearsOfExp >= 5) {
      strengths.push(`${yearsOfExp}+ years of professional experience demonstrates depth and seniority`);
    }
    if (hasBachelors || hasMasters || hasPhD) {
      strengths.push(`Holds a${hasPhD ? ' PhD' : hasMasters ? ' Master\'s degree' : ' Bachelor\'s degree'} — strong educational foundation`);
    }
    if (foundSkills.some(s => ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'].includes(s))) {
      strengths.push('Experience with cloud and DevOps technologies — highly valued in modern teams');
    }
    if (foundSkills.some(s => ['Agile', 'Scrum', 'Kanban'].includes(s))) {
      strengths.push('Familiarity with Agile methodologies indicates strong collaboration skills');
    }
    if (strengths.length === 0) {
      strengths.push('Resume demonstrates relevant professional background');
    }

    // Areas for improvement
    const improvements = [];
    if (foundSkills.length < 3) {
      improvements.push('Consider adding more specific technical skills to stand out to recruiters');
    }
    if (!text.match(/achieved|improved|increased|reduced|delivered|launched/i)) {
      improvements.push('Add quantifiable achievements (e.g., "increased efficiency by 20%") to demonstrate impact');
    }
    if (!text.match(/led|managed|owned|drove|initiated/i)) {
      improvements.push('Use stronger action verbs to describe your contributions');
    }
    if (text.split(/\s+/).length < 200) {
      improvements.push('Resume seems brief — consider adding more detail about your experience');
    }
    if (improvements.length === 0) {
      improvements.push('Resume appears well-structured — consider tailoring it further for specific roles');
    }

    // Match score (0-100)
    let matchScore = 50; // base
    matchScore += Math.min(foundSkills.length * 5, 25);
    matchScore += Math.min(yearsOfExp, 10) * 2;
    if (hasBachelors) matchScore += 5;
    if (hasMasters) matchScore += 3;
    if (hasPhD) matchScore += 2;
    matchScore = Math.min(Math.max(matchScore, 0), 100);

    return {
      summary,
      strengths,
      improvements,
      matchScore
    };
  }

  static _calculateFit(role, skills) {
    const roleKeywords = role.toLowerCase().split(' ').filter(w => w.length > 2);
    const matchingKeywords = roleKeywords.filter(keyword =>
      skills.some(skill => skill.toLowerCase().includes(keyword))
    );
    return matchingKeywords.length > 0
      ? `Found ${matchingKeywords.length} keyword matches for "${role}"`
      : `No direct skill matches found for "${role}"`;
  }
}

module.exports = ResumeAnalyzer;