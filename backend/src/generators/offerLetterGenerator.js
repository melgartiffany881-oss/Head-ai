/**
 * Offer Letter Generator
 * Generates professional, templated offer letters.
 */

class OfferLetterGenerator {
  static generate(data) {
    const { candidateName, role, companyName, startDate, salary, equity, benefits, location } = data;

    const salaryStr = salary ? `$${salary.toLocaleString()}` : '[competitive salary]';
    const equityStr = equity || '';
    const benefitsStr = benefits || 'comprehensive benefits package including health, dental, and vision insurance';
    const locationStr = location || '[Location]';
    const date = startDate || '[Start Date]';

    const offerLetter = `
${companyName || '[Company Name]'}
${locationStr}

**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

**Dear ${candidateName},**

We are delighted to extend this offer of employment for the position of **${role}** at **${companyName || '[Company Name]'}**. We were impressed with your skills, experience, and enthusiasm throughout the interview process, and we are confident that you will make valuable contributions to our team.

**Offer Details**

- **Position:** ${role}
- **Start Date:** ${date}
- **Location:** ${locationStr}
- **Reporting To:** [Manager Name]

**Compensation**

- **Base Salary:** ${salaryStr} per year
- **Pay Schedule:** Semi-monthly
${equityStr ? `\n**Equity:** ${equityStr}` : ''}

**Benefits**

${benefitsStr}

**Additional Terms**

- **Probation Period:** 90 days from start date
- **Paid Time Off:** [X] days per year, plus company holidays
- **Work Schedule:** [Full-time / Part-time], [X] hours per week

**At-Will Employment**

Employment with ${companyName || '[Company Name]'} is at-will. This means that either you or the company may terminate the employment relationship at any time, with or without cause or advance notice.

**Acceptance**

To accept this offer, please sign and return this letter by [Offer Expiration Date]. If you have any questions regarding the terms of this offer, please don't hesitate to reach out.

We are excited about the possibility of you joining our team and look forward to a successful collaboration.

Sincerely,

[Your Name]
[Your Title]
${companyName || '[Company Name]'}

---

**Acceptance**

I, ${candidateName}, accept the offer of employment for the position of ${role} at ${companyName || '[Company Name]'} as described above.

Signature: ______________________________

Date: __________________________________
`.trim();

    return { offerLetter };
  }
}

module.exports = OfferLetterGenerator;