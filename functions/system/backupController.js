const functions = require('firebase-functions/v1');

exports.scheduledFirestoreBackup = functions.pubsub.schedule('0 3 * * *').onRun(async (context) => {
    console.log("Firestore backup task triggered.");
});
