/**
 * Outreach Email Generator
 * Generates personalized candidate outreach emails in various tones.
 */

class EmailGenerator {
  static generate(data) {
    const { candidateName, candidateRole, companyName, yourRole, tone, keyPoints } = data;

    const name = candidateName || 'Candidate';
    const role = candidateRole || 'the role';
    const company = companyName || 'our company';
    const senderRole = yourRole || 'Recruiter';
    const emailTone = tone || 'professional';

    const points = (keyPoints || '').split(',').map(p => p.trim()).filter(Boolean);

    // Subject line varies by tone
    let subject;
    let greeting;
    let body;
    let closing;

    switch (emailTone) {
      case 'friendly':
        subject = `Exciting opportunity at ${company}! 🚀`;
        greeting = `Hi ${name},`;
        body = this._friendlyBody(name, role, company, senderRole, points);
        closing = 'Looking forward to connecting!\n\nBest regards';
        break;

      case 'urgent':
        subject = `Urgent: ${role} opportunity at ${company}`;
        greeting = `Hi ${name},`;
        body = this._urgentBody(name, role, company, senderRole, points);
        closing = 'I look forward to your prompt response.\n\nBest regards';
        break;

      case 'professional':
      default:
        subject = `Opportunity: ${role} position at ${company}`;
        greeting = `Dear ${name},`;
        body = this._professionalBody(name, role, company, senderRole, points);
        closing = 'I look forward to hearing from you.\n\nBest regards';
        break;
    }

    const fullBody = `${greeting}\n\n${body}\n\n${closing}\n${senderRole}\n${company}`;

    return { subject, body: fullBody };
  }

  static _professionalBody(name, role, company, senderRole, points) {
    let body = `I hope this message finds you well. I came across your profile and was impressed by your background and experience.`;

    body += `\n\nI'm reaching out from ${company} because we're looking for a talented ${role} to join our team. Based on your experience, I believe you could be a great fit for this opportunity.`;

    if (points.length > 0) {
      body += '\n\nHere are some highlights of the role:';
      points.forEach(p => {
        body += `\n• ${p}`;
      });
    }

    body += `\n\nI'd love to schedule a brief call to discuss this opportunity in more detail and learn more about your career interests. Would you be available for a 15-20 minute conversation sometime this week?`;

    return body;
  }

  static _friendlyBody(name, role, company, senderRole, points) {
    let body = `Hope you're having a great week! 👋`;

    body += `\n\nI've been following your work and I'm genuinely impressed by what you've been doing. I think you'd be a fantastic addition to the team here at ${company}, where we're looking for a ${role} to help us take things to the next level.`;

    if (points.length > 0) {
      body += '\n\nA few things that make this role exciting:';
      points.forEach(p => {
        body += `\n✨ ${p}`;
      });
    }

    body += `\n\nI'd love to grab a virtual coffee and chat about what you're looking for in your next move — no pressure, just a casual conversation to see if there's a fit. Let me know if you're open to connecting!`;

    return body;
  }

  static _urgentBody(name, role, company, senderRole, points) {
    let body = `I'm writing to you with an urgent and exciting opportunity at ${company}.`;

    body += `\n\nWe are actively hiring for a ${role} and your profile stands out as an exceptional match. We're looking to fill this position quickly, and I'd love to fast-track your application.`;

    if (points.length > 0) {
      body += '\n\nKey details:';
      points.forEach(p => {
        body += `\n• ${p}`;
      });
    }

    body += `\n\nCould we schedule a call within the next 2-3 days? I'd like to discuss the role and next steps promptly to ensure we don't miss the opportunity to work together.`;

    return body;
  }
}

module.exports = EmailGenerator;