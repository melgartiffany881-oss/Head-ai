/**
 * ATS Optimizer
 * Analyzes job descriptions vs resumes for ATS compatibility and provides optimization suggestions.
 */

class ATSOptimizer {
  static optimize(data) {
    const { jdText, resumeText } = data;

    if (!jdText || !resumeText) {
      return {
        matchScore: 0,
        missingKeywords: [],
        suggestions: [],
        optimizedSections: {}
      };
    }

    const jd = jdText.toLowerCase();
    const resume = resumeText.toLowerCase();

    // Extract keywords from JD
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
      'must', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'under', 'over', 'such', 'each', 'all',
      'both', 'few', 'more', 'most', 'other', 'some', 'any', 'no', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
      'well', 'how', 'what', 'when', 'where', 'which', 'who', 'whom'
    ]);

    // Get word frequency from JD
    const jdWords = jd.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    const jdFreq = {};
    jdWords.forEach(w => {
      jdFreq[w] = (jdFreq[w] || 0) + 1;
    });

    // Identify key terms (words appearing 2+ times in JD)
    const keyTerms = Object.entries(jdFreq)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word);

    // Multi-word key phrases
    const phrases = [
      'machine learning', 'artificial intelligence', 'data science', 'data analysis',
      'project management', 'product management', 'cross-functional', 'full stack',
      'front end', 'back end', 'software development', 'software engineering',
      'agile methodology', 'continuous integration', 'continuous delivery',
      'deep learning', 'natural language processing', 'computer vision',
      'business intelligence', 'customer success', 'customer experience',
      'user experience', 'user interface', 'quality assurance', 'test automation',
      'cloud computing', 'data engineering', 'data pipeline', 'big data',
      'technical writing', 'solution architecture', 'system design'
    ];

    const foundPhrases = phrases.filter(p => resume.includes(p));

    // Check which key terms are missing from resume
    const missingKeywords = keyTerms.filter(term => !resume.includes(term));

    // Calculate match score
    const totalKeyTerms = keyTerms.length;
    const matchedTerms = totalKeyTerms - missingKeywords.length;
    const baseScore = totalKeyTerms > 0 ? (matchedTerms / totalKeyTerms) * 60 : 30;
    const phraseBonus = Math.min(foundPhrases.length * 5, 20);
    const lengthBonus = Math.min(resume.split(/\s+/).length / 20, 20);
    let matchScore = Math.min(Math.round(baseScore + phraseBonus + lengthBonus), 100);

    // Generate suggestions
    const suggestions = [];

    if (missingKeywords.length > 0) {
      const topMissing = missingKeywords.slice(0, 5);
      suggestions.push(`Add these keywords to your resume: ${topMissing.join(', ')}`);
    }

    if (resume.split(/\s+/).length < 300) {
      suggestions.push('Consider expanding your resume content for better ATS matching');
    }

    if (!resume.match(/\d+/)) {
      suggestions.push('Include quantifiable achievements (numbers, percentages) to strengthen your resume');
    }

    if (!jdWords.some(w => resume.includes(w))) {
      suggestions.push('Your resume may not be well-aligned with this job description. Consider tailoring it with relevant keywords from the JD.');
    }

    if (suggestions.length === 0) {
      suggestions.push('Your resume appears well-matched to this job description');
      matchScore = Math.min(matchScore + 10, 100);
    }

    // Optimized sections — suggest improvements
    const optimizedSections = {
      keywordsToAdd: missingKeywords.slice(0, 8),
      phrasesToAdd: foundPhrases.length === 0 ? phrases.slice(0, 3) : [],
      skillsSection: missingKeywords.length > 3
        ? 'Consider adding a "Skills" section with relevant technical keywords'
        : undefined,
      experienceSection: !resume.includes('achieved') && !resume.includes('increased') && !resume.includes('improved')
        ? 'Add measurable outcomes to your experience descriptions'
        : undefined
    };

    // Clean up undefined
    Object.keys(optimizedSections).forEach(key => {
      if (optimizedSections[key] === undefined) delete optimizedSections[key];
    });

    return {
      matchScore,
      missingKeywords: missingKeywords.slice(0, 15),
      suggestions,
      optimizedSections
    };
  }
}

module.exports = ATSOptimizer;