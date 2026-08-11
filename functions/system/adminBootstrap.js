const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { Logger } = require('./Logger');

/**
 * Grants admin privileges via Firebase custom claims — server-side only, never
 * shipped to client source. Replaces the old AuthContext.jsx client pattern that
 * hardcoded this exact email list in the browser bundle and self-wrote
 * role/isAdmin onto the user's own Firestore doc (a privilege-escalation path:
 * any signed-in user could have written those fields themselves before the
 * Firestore rule closed it — see firestore.rules `users/{userId}` update rule).
 *
 * Custom claims are the source of truth Firestore rules already check
 * (isAdmin() reads request.auth.token.role/.admin). role/isAdmin are also
 * mirrored onto the user's Firestore doc via the trusted Admin SDK (bypasses
 * rules) purely so existing client UI (AdminRoute, etc.) keeps working without
 * every admin-gated screen needing to read ID token claims directly.
 */
// Sourced from functions/.env (gitignored, deployed as Cloud Functions runtime
// config) — see functions/.env.example. Never hardcode this list in source.
function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

exports.grantAdminClaimsOnCreate = functions.auth.user().onCreate(async (user) => {
  const email = user.email?.toLowerCase();
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    Logger.warn('ADMIN_EMAILS is not configured — no admin claims will ever be granted', {});
  }
  if (!email || !adminEmails.includes(email)) return;

  try {
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin', admin: true });
    await admin.firestore().collection('users').doc(user.uid).set(
      { role: 'admin', isAdmin: true },
      { merge: true }
    );
    Logger.info('Granted admin claims on account creation', { uid: user.uid, email });
  } catch (error) {
    Logger.error('Failed to grant admin claims', { uid: user.uid, email }, error);
  }
});
