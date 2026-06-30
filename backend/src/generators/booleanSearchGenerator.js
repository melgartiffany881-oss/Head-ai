/**
 * Boolean Search String Generator
 * Generates optimized boolean search strings for LinkedIn, Indeed, and general use.
 */

class BooleanSearchGenerator {
  static generate(data) {
    const { role, requiredSkills, preferredSkills, location, experienceLevel } = data;

    const roleTerms = role.split(' ').filter(Boolean);
    const roleOr = roleTerms.length > 1
      ? `("${role}" OR ${roleTerms.map(t => `"${t}"`).join(' OR ')})`
      : `"${role}"`;

    const required = (requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);
    const preferred = (preferredSkills || '').split(',').map(s => s.trim()).filter(Boolean);

    const requiredAnd = required.length > 0
      ? required.map(s => `"${s}"`).join(' AND ')
      : '';

    const preferredOr = preferred.length > 0
      ? preferred.map(s => `"${s}"`).join(' OR ')
      : '';

    const locationStr = location ? ` AND "${location}"` : '';
    const expStr = experienceLevel ? ` AND "${experienceLevel}"` : '';

    // LinkedIn format — uses parentheses and AND/OR
    const linkedinBase = requiredAnd
      ? `${roleOr} AND ${requiredAnd}`
      : roleOr;
    const linkedin = `${linkedinBase}${locationStr}${expStr}`;

    // Indeed format — simpler, uses + and "
    const indeedParts = [`"${role}"`];
    required.forEach(s => indeedParts.push(`"${s}"`));
    if (location) indeedParts.push(`"${location}"`);
    const indeed = indeedParts.join(' ');

    // General format — comprehensive boolean with optional skills
    let general = `(${roleOr})`;
    if (requiredAnd) general += ` AND (${requiredAnd})`;
    if (preferredOr) general += ` AND (${preferredOr})`;
    if (location) general += ` AND "${location}"`;
    if (experienceLevel) general += ` AND "${experienceLevel}"`;

    return {
      linkedin,
      indeed,
      general
    };
  }
}

module.exports = BooleanSearchGenerator;