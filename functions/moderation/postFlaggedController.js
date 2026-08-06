const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

exports.onPostFlagged = functions.firestore.document('posts/{postId}').onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    if (!data) return; // Deleted

    // Check if it's flagged and not yet notified
    if (data.flagged === true && data.adminNotified !== true) {
        try {
            const db = admin.firestore();
            
            // 1. Write to admin_alerts collection
            await db.collection('admin_alerts').add({
                postId: context.params.postId,
                riskLevel: data.riskLevel || 'high',
                content: data.content,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });

            // 2. Mark as notified so we don't trigger repeatedly
            await change.after.ref.update({ adminNotified: true });

            // 3. Send email using Nodemailer
            // Replace credentials with actual environment variables or configuration
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER || 'rupesh2510@gmail.com',
                    pass: process.env.GMAIL_PASS || 'fake-password' // Note: Recommend using Secret Manager or functions.config()
                }
            });

            const mailOptions = {
                from: '"SoulThread Safety" <noreply@soulthread.in>',
                to: 'rupesh2510@gmail.com,anchalmaurya406@gmail.com,bhavyajha.bhu@gmail.com',
                subject: `🚨 [URGENT] Flagged Post Alert - ${data.riskLevel}`,
                text: `A post has been flagged on SoulThread.\n\nRisk Level: ${data.riskLevel}\nPost ID: ${context.params.postId}\nContent: "${data.content}"\n\nPlease review it in the admin dashboard.`
            };

            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Error handling flagged post notification:', err);
        }
    }
});
