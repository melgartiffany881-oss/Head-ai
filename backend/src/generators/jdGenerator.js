/**
 * Job Description Generator — uses OpenAI with template fallback
 */

const { generateWithAI } = require('../adapters/aiAdapter');

class JDGenerator {
  static async generate(data) {
    const aiResult = await generateWithAI(
      `You are a senior HR and recruiting expert. Generate a professional, complete job description.`,
      `Create a job description with these details:
- Title: ${data.title || 'Not specified'}
- Seniority: ${data.seniority || 'Mid-level'}
- Industry: ${data.industry || 'Technology'}
- Company Culture: ${data.companyCulture || 'dynamic and fast-paced'}
- Key Responsibilities: ${data.keyResponsibilities || 'Standard role responsibilities'}
- Requirements: ${data.requirements || 'Relevant experience and skills'}

Include: About the Role, Key Responsibilities, Qualifications, What We Offer, and Equal Opportunity statement.`,
      { temperature: 0.7, maxTokens: 2000 }
    );

    if (aiResult) return { jd: aiResult };

    // Fallback: use deterministic template
    return this._fallback(data);
  }

  static _fallback(data) {
    const { title, seniority, industry, companyCulture, keyResponsibilities, requirements } = data;
    const seniorityLabel = seniority || 'Mid-level';
    const industryLabel = industry || 'Technology';
    const cultureBlurb = companyCulture || 'a dynamic and fast-paced environment';

    const defaultResponsibilities = [
      `Collaborate with cross-functional teams to define and implement ${title?.toLowerCase() || 'role'} strategies`,
      `Drive key initiatives from conception through delivery`,
      `Contribute to technical and architectural decisions`,
      `Mentor junior team members and contribute to team growth`,
      `Stay current with industry trends and best practices`
    ];

    const responsibilities = keyResponsibilities
      ? keyResponsibilities.split(',').map(r => r.trim())
      : defaultResponsibilities;

    const defaultRequirements = [
      `${seniorityLabel}+ experience as a ${title || 'professional'} or similar role`,
      `Strong understanding of industry best practices`,
      `Excellent communication and collaboration skills`,
      'Proven track record of delivering high-quality results',
      'Ability to thrive in a fast-paced environment'
    ];

    const reqs = requirements
      ? requirements.split(',').map(r => r.trim())
      : defaultRequirements;

    const jd = `
Job Title: ${title || '[Title]'}
Seniority: ${seniorityLabel}
Industry: ${industryLabel}
Location: Remote / On-site / Hybrid

About the Role
${companyCulture ? `At ${companyCulture}, we're looking for a ${title || 'professional'} to join our growing team.` : `We're looking for a ${title || 'professional'} to join our growing team.`} You'll play a key role in driving our mission forward in ${industryLabel.toLowerCase()}. This role is perfect for someone who thrives in ${cultureBlurb}.

Key Responsibilities
${responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Qualifications
${reqs.map((r, i) => `${i + 1}. ${r}`).join('\n')}

What We Offer
- Competitive salary and comprehensive benefits package
- Professional development opportunities
- Flexible work arrangements
- Collaborative and inclusive culture
- Opportunity to make a significant impact

How to Apply
Submit your resume and cover letter. We look forward to hearing from you!

${companyCulture || '[Company Name]'} is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
`.trim();

    return { jd };
  }
}

module.exports = JDGenerator;