/**
 * growth_automation.js — SoulThread Platform Growth Functions
 *
 * Four scheduled/triggered functions:
 *  1. rotateDailyPrompt       — daily at midnight IST
 *  2. sendWeeklyDigest        — every Sunday 9am IST (email to opted-in users)
 *  3. onNewPostNotifyFollowers — FCM push to followers on new public post
 *  4. reEngagementPush        — daily 10am IST, re-engages users inactive 7+ days
 */

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

function getDb() {
    if (!admin.apps.length) admin.initializeApp();
    return admin.firestore();
}

// ── Fallback prompts (used when prompt_pool collection is empty) ──────────────
const FALLBACK_PROMPTS = [
    "What's something you've been carrying lately that you haven't said out loud?",
    "When did you last feel truly at peace — and what made that possible?",
    "What do you wish someone would just ask you today?",
    "What are you pretending to be okay about?",
    "Who do you miss but can't reach out to — and why?",
    "What part of you goes unseen in almost every room you walk into?",
    "What would you do differently if fear wasn't part of the equation?",
    "What's something you've never said to the person you needed to say it to?",
    "When do you feel most like yourself?",
    "What does loneliness feel like to you — specifically?",
    "What version of yourself are you most afraid of becoming?",
    "What truth have you been protecting someone else from?",
    "What do you need right now that you haven't asked for?",
    "If you could say one thing anonymously to someone in your life — what would it be?",
    "What habit is quietly hurting you that you haven't admitted yet?",
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. DAILY PROMPT ROTATION
// Runs at midnight IST every day (18:30 UTC)
// ─────────────────────────────────────────────────────────────────────────────
exports.rotateDailyPrompt = functions.pubsub
    .schedule('30 18 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async () => {
        const db = getDb();
        const todayStr = new Date().toISOString().split('T')[0];

        // Idempotency: skip if prompt already exists for today
        const existingSnap = await db.collection('daily_prompts')
            .where('activeDate', '==', todayStr)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (!existingSnap.empty) {
            console.log(`[DailyPrompt] Already set for ${todayStr} — skipping`);
            return null;
        }

        const batch = db.batch();

        // Deactivate previous prompts
        const activeSnap = await db.collection('daily_prompts')
            .where('isActive', '==', true)
            .get();
        activeSnap.docs.forEach(doc => batch.update(doc.ref, { isActive: false }));

        // Pick a prompt from pool, fall back to hardcoded list
        let promptText;
        const poolSnap = await db.collection('prompt_pool')
            .where('used', '==', false)
            .limit(1)
            .get();

        if (!poolSnap.empty) {
            const poolDoc = poolSnap.docs[0];
            promptText = poolDoc.data().text;
            batch.update(poolDoc.ref, {
                used: true,
                usedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            // Pool exhausted — reset all and pick randomly
            const allPoolSnap = await db.collection('prompt_pool').get();
            if (!allPoolSnap.empty) {
                allPoolSnap.docs.forEach(doc =>
                    batch.update(doc.ref, { used: false, usedAt: null })
                );
                const pick = allPoolSnap.docs[Math.floor(Math.random() * allPoolSnap.docs.length)];
                promptText = pick.data().text;
                batch.update(pick.ref, { used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });
            } else {
                promptText = FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
            }
        }

        // Write today's prompt
        const newPromptRef = db.collection('daily_prompts').doc();
        batch.set(newPromptRef, {
            text: promptText,
            isActive: true,
            activeDate: todayStr,
            responseCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();
        console.log(`[DailyPrompt] ✅ Set for ${todayStr}: "${promptText.slice(0, 60)}..."`);
        return null;
    });

// ─────────────────────────────────────────────────────────────────────────────
// 2. WEEKLY DIGEST EMAIL
// Runs every Sunday at 9am IST (3:30 UTC). Sends top posts to opted-in users
// via the Firebase "Trigger Email from Firestore" extension (mail collection).
// ─────────────────────────────────────────────────────────────────────────────
exports.sendWeeklyDigest = functions.pubsub
    .schedule('30 3 * * 0')
    .timeZone('Asia/Kolkata')
    .onRun(async () => {
        const db = getDb();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Top posts from this week (public, non-circle)
        const postsSnap = await db.collection('posts')
            .where('createdAt', '>=', sevenDaysAgo)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const weekPosts = postsSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => !p.circleId)
            .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
            .slice(0, 5);

        if (weekPosts.length === 0) {
            console.log('[WeeklyDigest] No posts this week — skipping');
            return null;
        }

        // Users opted into email digest
        const usersSnap = await db.collection('users')
            .where('emailDigest', '==', true)
            .get();

        const recipients = usersSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.email && u.email.includes('@'));

        if (recipients.length === 0) {
            console.log('[WeeklyDigest] No opted-in recipients — skipping');
            return null;
        }

        // Build post cards HTML
        const postsHtml = weekPosts.map(post => {
            const preview = (post.content || '').length > 200
                ? post.content.slice(0, 197) + '...'
                : post.content || '';
            const author = post.isIncognito ? 'Anonymous Soul' : (post.authorName || 'A community member');
            const category = post.categoryId || 'General';
            return `
            <div style="background:#f9f6ff;border-radius:12px;padding:20px;margin-bottom:16px;border-left:4px solid #7c3aed;">
                <div style="font-size:11px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">
                    ${category}
                </div>
                <p style="font-size:16px;color:#1a1a2e;line-height:1.7;margin:0 0 14px;font-style:italic;">
                    "${preview}"
                </p>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:12px;color:#666;">— ${author}</span>
                    <span style="font-size:12px;color:#7c3aed;">&#10084; ${post.likesCount || 0}</span>
                </div>
            </div>`;
        }).join('');

        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#eee;margin:0;padding:24px 16px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:44px 36px;text-align:center;">
      <div style="font-size:12px;color:#a78bfa;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:14px;">
        This Week on SoulThread
      </div>
      <h1 style="color:#fff;font-size:30px;font-weight:900;margin:0 0 10px;letter-spacing:-0.03em;">
        What Your Community Is Sharing
      </h1>
      <p style="color:rgba(255,255,255,0.65);font-size:15px;margin:0;line-height:1.6;">
        Real thoughts. Real feelings. No names required.
      </p>
    </div>

    <div style="padding:36px;">
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Here are five moments from your community this week — things people needed to say, and finally did.
      </p>

      ${postsHtml}

      <div style="text-align:center;margin-top:36px;padding-top:28px;border-top:1px solid #eee;">
        <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Something on your mind this week?
        </p>
        <a href="https://soulthread.in/"
           style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;
                  padding:16px 36px;border-radius:999px;font-weight:800;font-size:15px;
                  display:inline-block;box-shadow:0 4px 15px rgba(124,58,237,0.35);">
          Share Anonymously — Free
        </a>
        <p style="color:#888;font-size:13px;margin:16px 0 0;">
          <a href="https://soulthread.in/" style="color:#7c3aed;">Read more stories on SoulThread</a>
        </p>
      </div>
    </div>

    <div style="background:#f8f6ff;padding:20px 36px;text-align:center;border-top:1px solid #ece8ff;">
      <p style="color:#aaa;font-size:12px;margin:0;line-height:1.8;">
        You're receiving this because you opted in to weekly digests.<br>
        <a href="https://soulthread.in/settings" style="color:#7c3aed;">Manage email preferences</a>
        &nbsp;·&nbsp; soulthread.in
      </p>
    </div>

  </div>
</body>
</html>`;

        // Write to mail collection in chunks (Firebase Extension limit: 500/batch)
        const BATCH_SIZE = 400;
        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const mailBatch = db.batch();
            recipients.slice(i, i + BATCH_SIZE).forEach(user => {
                const mailRef = db.collection('mail').doc();
                mailBatch.set(mailRef, {
                    to: user.email,
                    message: {
                        subject: 'This week on SoulThread — what your community is sharing',
                        html: emailHtml,
                    },
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            await mailBatch.commit();
        }

        console.log(`[WeeklyDigest] ✅ Queued digest for ${recipients.length} users`);
        return null;
    });

// ─────────────────────────────────────────────────────────────────────────────
// 3. NEW POST → NOTIFY FOLLOWERS
// Triggers when a new public (non-incognito, non-circle) post is created.
// Sends FCM push to each follower who has a token.
// ─────────────────────────────────────────────────────────────────────────────
exports.onNewPostNotifyFollowers = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snap, context) => {
        const db = getDb();
        const post = snap.data();
        const postId = context.params.postId;

        // Only notify for public named posts
        if (post.isIncognito || post.circleId || !post.authorId) return null;

        let followerIds = [];
        try {
            const followersSnap = await db
                .collection('users')
                .doc(post.authorId)
                .collection('followers')
                .get();
            followerIds = followersSnap.docs.map(d => d.id);
        } catch (e) {
            console.log(`[FollowerNotify] No followers subcollection for ${post.authorId}`);
            return null;
        }

        if (followerIds.length === 0) return null;

        const authorName = post.authorName || 'Someone you follow';
        const preview = (post.content || '').length > 100
            ? post.content.slice(0, 97) + '…'
            : post.content || 'Shared something new.';

        // Send in chunks of 10 to stay within reasonable concurrency
        const CHUNK = 10;
        for (let i = 0; i < followerIds.length; i += CHUNK) {
            const chunk = followerIds.slice(i, i + CHUNK);
            const userSnaps = await Promise.all(
                chunk.map(uid => db.collection('users').doc(uid).get())
            );

            const eligibleUsers = userSnaps.filter(s => s.exists && s.data().fcmToken);

            await Promise.all(eligibleUsers.map(userSnap =>
                admin.messaging().send({
                    token: userSnap.data().fcmToken,
                    notification: {
                        title: `${authorName} shared something`,
                        body: preview,
                    },
                    data: {
                        type: 'NEW_POST',
                        postId,
                        url: `/post/${postId}`,
                    },
                    android: { priority: 'high' },
                    webpush: {
                        notification: { icon: '/icon-192.png', badge: '/badge-72.png' },
                        fcmOptions: { link: `https://soulthread.in/post/${postId}` },
                    },
                }).catch(err => {
                    if (err.code === 'messaging/registration-token-not-registered') {
                        db.collection('users').doc(userSnap.id).update({
                            fcmToken: admin.firestore.FieldValue.delete(),
                        });
                    }
                })
            ));
        }

        console.log(`[FollowerNotify] ✅ Notified ${followerIds.length} followers for post ${postId}`);
        return null;
    });

// ─────────────────────────────────────────────────────────────────────────────
// 4. RE-ENGAGEMENT PUSH
// Runs daily at 10am IST (4:30 UTC).
// Sends FCM to users inactive for 7+ days who haven't been nudged in 3 days.
// ─────────────────────────────────────────────────────────────────────────────
exports.reEngagementPush = functions.pubsub
    .schedule('30 4 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async () => {
        const db = getDb();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Users inactive 7+ days with a valid FCM token
        const usersSnap = await db.collection('users')
            .where('lastActiveAt', '<=', sevenDaysAgo)
            .where('fcmToken', '!=', null)
            .limit(500)
            .get();

        // Filter out users nudged within the last 3 days
        const candidates = usersSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => {
                if (!u.lastReEngagementAt) return true;
                const lastSent = u.lastReEngagementAt.toDate
                    ? u.lastReEngagementAt.toDate()
                    : new Date(u.lastReEngagementAt);
                return lastSent < threeDaysAgo;
            });

        if (candidates.length === 0) {
            console.log('[ReEngagement] No candidates today');
            return null;
        }

        const messages = [
            {
                title: 'Someone shared something real today',
                body: 'Your community is here. You don\'t have to carry it alone.',
            },
            {
                title: 'We\'ve missed you on SoulThread',
                body: 'There\'s a new reflection prompt waiting — just for moments like this.',
            },
            {
                title: 'This week\'s conversations might surprise you',
                body: 'People are opening up. Come see what\'s being shared.',
            },
        ];

        const now = admin.firestore.FieldValue.serverTimestamp();
        const updateBatch = db.batch();

        await Promise.all(candidates.map(user => {
            const msg = messages[Math.floor(Math.random() * messages.length)];

            // Mark as re-engaged so we don't spam them
            updateBatch.update(db.collection('users').doc(user.id), {
                lastReEngagementAt: now,
            });

            return admin.messaging().send({
                token: user.fcmToken,
                notification: { title: msg.title, body: msg.body },
                data: { type: 'RE_ENGAGEMENT', url: '/' },
                android: { priority: 'normal' },
                webpush: {
                    notification: { icon: '/icon-192.png', badge: '/badge-72.png' },
                    fcmOptions: { link: 'https://soulthread.in/' },
                },
            }).catch(err => {
                if (err.code === 'messaging/registration-token-not-registered') {
                    updateBatch.update(db.collection('users').doc(user.id), {
                        fcmToken: admin.firestore.FieldValue.delete(),
                    });
                }
            });
        }));

        await updateBatch.commit();
        console.log(`[ReEngagement] ✅ Sent to ${candidates.length} users`);
        return null;
    });
