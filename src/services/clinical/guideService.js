import { GuideRepository } from '../../repositories/GuideRepository';

export const GuideService = {
  /**
   * Fetches all available and verified guides for the discovery page.
   * @param {number} limitCount 
   * @returns {Promise<Array>}
   */
  async getVerifiedGuides(limitCount = 50) {
    try {
      return await GuideRepository.getVerifiedGuides(limitCount);
    } catch (error) {
      console.error('[GuideService] Failed to fetch guides:', error);
      throw new Error('Failed to load professionals. Please try again later.');
    }
  }
};
