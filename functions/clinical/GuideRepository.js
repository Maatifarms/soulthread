const admin = require('firebase-admin');

class GuideRepository {
  /**
   * Fetches top-rated available and verified guides.
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  static async getTopAvailableGuides(limit = 5) {
    const guidesSnap = await admin.firestore()
      .collection('guides')
      .where('isAvailable', '==', true)
      .where('isVerified', '==', true)
      .orderBy('rating', 'desc')
      .limit(limit)
      .get();

    return guidesSnap.docs.map(d => ({
      id: d.id,
      name: d.data().name,
      specializations: d.data().specializations || [],
      rating: d.data().rating,
      sessionPrice: d.data().sessionPrice,
      avatarUrl: d.data().avatarUrl,
      bio: d.data().bio
    }));
  }
}

module.exports = { GuideRepository };
