const functions = require('firebase-functions/v1');
const { MatchingEngine } = require('./MatchingEngine');
const { GuideRepository } = require('./GuideRepository');

exports.matchGuideForCaretaker = functions.https.onCall(async (data, context) => {
  // V2 SECURITY: Ensure authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { issueType } = data;

  try {
    // 1. Determine Required Specializations
    const requiredSpecializations = MatchingEngine.getRequiredSpecializations(issueType);

    // 2. Fetch Available Pool
    // V2 SCALABILITY: Limit to top 20 instead of 5 for a wider matching pool, 
    // but still bounded to prevent excessive reads.
    const availableGuides = await GuideRepository.getTopAvailableGuides(20);

    // 3. Score and Rank
    const rankedGuides = MatchingEngine.rankGuides(availableGuides, requiredSpecializations);

    // 4. Return top 3 matches
    return { guides: rankedGuides.slice(0, 3) };
  } catch (err) {
    console.error('[CRITICAL] Matching Engine Error:', err);
    // V2 SECURITY: Do not leak internal error messages or stack traces to the client.
    throw new functions.https.HttpsError('internal', 'An error occurred while finding a match. Please try again.');
  }
});
