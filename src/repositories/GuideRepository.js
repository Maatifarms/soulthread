import { BaseRepository } from './BaseRepository';
import { limit, where } from 'firebase/firestore';

class GuideRepositoryImpl extends BaseRepository {
  constructor() {
    super('guides');
  }

  /**
   * Fetches verified guides up to a limit.
   * Note: the `guides` collection uses `verified` (not `isVerified` — that field
   * name is used elsewhere in the codebase for a different collection/purpose).
   * @param {number} limitCount
   * @returns {Promise<Array>}
   */
  async getVerifiedGuides(limitCount = 50) {
    return this.findMany([
      where('verified', '==', true),
      limit(limitCount)
    ]);
  }
}

export const GuideRepository = new GuideRepositoryImpl();
