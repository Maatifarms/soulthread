// functions/support_notifications.js — Production Email Delivery for Support Requests
const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer transporter using environment variables or fallback SMTP config
 */
function createTransporter() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'rupesh2510@gmail.com';
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });
}

/**
 * Cloud Function handler for new support requests
 */
async function handleNewSupportRequest(snap, context, admin) {
    const data = snap.data();
    const requestId = snap.id;

    // Reject honeypot spam immediately
    if (data.honeypot) {
        console.warn(`[SPAM DETECTED] Support request ${requestId} contained honeypot value.`);
        return snap.ref.update({ status: 'Spam', rejectedReason: 'Honeypot filled' });
    }

    const timestamp = data.createdAt ? new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const recipientEmail = process.env.NOTIFICATION_RECIPIENT_EMAIL || 'rupesh2510@gmail.com';

    const plainTextBody = `
-----------------------------------------
New Mental Health Support Request

Submitted At: ${timestamp}

Name: ${data.name || 'N/A'}
Email: ${data.email || 'N/A'}
Phone: ${data.phone || 'N/A'}

Concern: ${data.concern || data.struggle || 'N/A'}
Preferred Language: ${data.language || 'Hindi / English'}
Preferred Contact Method: ${data.contactMethod || 'N/A'}
Preferred Contact Time: ${data.preferredTime || 'Anytime'}
Urgency: ${data.urgency || 'Within 24 hours'}

Message:
${data.message || 'None provided'}

User IP: ${data.ip || 'N/A'}
Browser: ${data.userAgent || data.browser || 'N/A'}
Device: ${data.device || 'Web Browser'}
Referral Source: ${data.referrer || 'Direct'}
-----------------------------------------
`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Mental Health Support Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f8; color: #1e293b; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="background: #0d9488; color: #ffffff; padding: 24px 30px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;">New Mental Health Support Request</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">SoulThread Sanctuary Lead Notification</p>
        </div>
        <div style="padding: 30px;">
            <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #475569;">
                <strong>Submitted At:</strong> ${timestamp}
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${data.name || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${data.email}">${data.email || 'N/A'}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #0f172a;"><a href="tel:${data.phone}">${data.phone || 'N/A'}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Concern:</strong></td><td style="padding: 8px 0; color: #0d9488; font-weight: 700;">${data.concern || data.struggle || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Language:</strong></td><td style="padding: 8px 0; color: #0f172a;">${data.language || 'Hindi / English'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Contact Method:</strong></td><td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${data.contactMethod || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Contact Time:</strong></td><td style="padding: 8px 0; color: #0f172a;">${data.preferredTime || 'Anytime'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Urgency:</strong></td><td style="padding: 8px 0; color: #ef4444; font-weight: 700;">${data.urgency || 'Within 24 hours'}</td></tr>
            </table>

            <div style="margin-top: 20px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
                <strong style="display: block; margin-bottom: 6px; font-size: 13px; color: #475569;">Message Note:</strong>
                <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${data.message || 'No additional message provided'}</p>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <div><strong>Browser:</strong> ${data.userAgent || data.browser || 'N/A'}</div>
                <div><strong>Referral Source:</strong> ${data.referrer || 'Direct'}</div>
                <div><strong>IP Address:</strong> ${data.ip || 'N/A'}</div>
            </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            SoulThread Mental Health Sanctuary • Private & Confidential Notification
        </div>
    </div>
</body>
</html>
`;

    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: '"SoulThread Care Team" <support@soulthread.in>',
            to: recipientEmail,
            subject: `New Mental Health Support Request – SoulThread`,
            text: plainTextBody,
            html: htmlBody
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SUCCESS] Sent support request notification for ${requestId}: ${info.messageId}`);
        
        await snap.ref.update({
            emailSent: true,
            emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
            emailMessageId: info.messageId || 'sent'
        });
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send email for support request ${requestId}:`, error);
        await snap.ref.update({
            emailSent: false,
            emailError: error.message || 'Failed to dispatch SMTP email'
        });
    }
}

module.exports = { handleNewSupportRequest };
