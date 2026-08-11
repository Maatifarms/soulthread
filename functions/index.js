const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();

// ── Existing Modular Imports ──
exports.askSoulGuide = functions.https.onCall(async (data, context) => {
    const soulguide = require('./soulguide_core');
    return soulguide.handleAskSoulGuide(data, context);
});

const { askSalesAgent, refineContent } = require('./soulmaven_core');
const { generateOutreachMessage } = require('./soulmaven_outreach_core');

exports.askSalesAgent = functions.https.onCall(async (data, context) => {
    return await askSalesAgent(data, context);
});

exports.refineContent = functions.https.onCall(async (data, context) => {
    return await refineContent(data, context);
});

exports.generateSocialOutreach = functions.https.onCall(async (data, context) => {
    return await generateOutreachMessage(data.platform, data.postContent, data.context || "");
});

const notifications = require('./notifications');
exports.onNewChatMessage = notifications.onNewChatMessage;
exports.onNotificationCreate = notifications.onNotificationCreate;

exports.createPost = functions.https.onCall(async (data, context) => {
    const feed = require('./feed_logic');
    return feed.handleCreatePost(data, context);
});

exports.createInvite = functions.https.onCall(async (data, context) => {
    const feed = require('./feed_logic');
    return feed.handleCreateInvite(data, context);
});

exports.aggregateGlobalMetrics = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    const adminLogic = require('./admin_logic');
    return adminLogic.handleAggregateGlobalMetrics(context);
});

const growth = require('./growth_automation');
exports.rotateDailyPrompt        = growth.rotateDailyPrompt;
exports.sendWeeklyDigest         = growth.sendWeeklyDigest;
exports.onNewPostNotifyFollowers = growth.onNewPostNotifyFollowers;
exports.reEngagementPush         = growth.reEngagementPush;
exports.dailyGentlePrompt        = growth.dailyGentlePrompt;

const payments = require('./payments');
exports.createSubscriptionOrder     = payments.createSubscriptionOrder;
exports.createSessionOrder           = payments.createSessionOrder;
exports.cashfreeWebhook              = payments.cashfreeWebhook;
exports.expireSubscriptions          = payments.expireSubscriptions;
exports.subscriptionRenewalReminder  = payments.subscriptionRenewalReminder;

// ── Newly Refactored Modules ──
const eventRouter = require('./events/EventRouter');
exports.processSystemEvent = eventRouter.processSystemEvent;

const webhookController = require('./finance/webhookController');
exports.handlePaymentWebhook = webhookController.handlePaymentWebhook;

const attendanceController = require('./sessions/attendanceController');
exports.onAttendanceChange = attendanceController.onAttendanceChange;

const inviteController = require('./community/inviteController');
exports.onInviteCreate = inviteController.onInviteCreate;

const matchingController = require('./clinical/matchingController');
exports.matchGuideForCaretaker = matchingController.matchGuideForCaretaker;

const followController = require('./community/followController');
exports.onNewFollow = followController.onNewFollow;

const postFlaggedController = require('./moderation/postFlaggedController');
exports.onPostFlagged = postFlaggedController.onPostFlagged;

const commentController = require('./community/commentController');
exports.onNewComment = commentController.onNewComment;

const reminderController = require('./calendar/reminderController');
exports.seriesDailyReminder = reminderController.seriesDailyReminder;
exports.sessionReminder = reminderController.sessionReminder;

const bookingAPI = require('./booking/bookingAPI');
exports.createBooking = bookingAPI.createBooking;
exports.acceptBooking = bookingAPI.acceptBooking;
exports.rejectBooking = bookingAPI.rejectBooking;
exports.cancelBooking = bookingAPI.cancelBooking;
exports.checkIn = bookingAPI.checkIn;

const patientLookupAPI = require('./booking/patientLookupAPI');
exports.getPatientProfileForGuide = patientLookupAPI.getPatientProfileForGuide;
exports.getPatientWorkspaceForGuide = patientLookupAPI.getPatientWorkspaceForGuide;

const calendarAPI = require('./calendar/calendarAPI');
exports.getAvailableSlots = calendarAPI.getAvailableSlots;
exports.updateAvailability = calendarAPI.updateAvailability;
exports.blockDate = calendarAPI.blockDate;
exports.reserveSlot = calendarAPI.reserveSlot;
exports.releaseSlot = calendarAPI.releaseSlot;

const backupController = require('./system/backupController');
exports.scheduledFirestoreBackup = backupController.scheduledFirestoreBackup;

const healthAPI = require('./system/healthAPI');
exports.healthCheck = healthAPI.healthCheck;

const adminBootstrap = require('./system/adminBootstrap');
exports.grantAdminClaimsOnCreate = adminBootstrap.grantAdminClaimsOnCreate;
