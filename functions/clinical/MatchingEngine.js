const { ISSUE_CATEGORIES } = require('../config/issueCategories');

class MatchingEngine {
  /**
   * Scores and ranks a list of guides based on requested specializations.
   * @param {Array} guides 
   * @param {Array} requestedSpecializations 
   * @returns {Array} Sorted list of scored guides
   */
  static rankGuides(guides, requestedSpecializations) {
    if (!requestedSpecializations || requestedSpecializations.length === 0) {
      return guides.sort((a, b) => b.rating - a.rating);
    }

    const scored = guides.map(g => {
      const matchScore = requestedSpecializations.filter(s =>
        (g.specializations || []).some(gs =>
          gs.toLowerCase().includes(s.toLowerCase())
        )
      ).length;

      return { ...g, matchScore };
    });

    // Primary sort: Match Score. Secondary sort: Rating.
    return scored.sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);
  }

  /**
   * Retrieves required specializations for a given issue type.
   */
  static getRequiredSpecializations(issueType) {
    const categoryConfig = ISSUE_CATEGORIES[issueType] || ISSUE_CATEGORIES['caretaker'];
    return categoryConfig.guideSpecializations || [];
  }
}

module.exports = { MatchingEngine };
