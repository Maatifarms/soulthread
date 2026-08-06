const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { PaymentService } = require('./PaymentService');
const { EventPublisher } = require('../events/EventPublisher');
const crypto = require('crypto');

/**
 * financeWebhooks.js handles raw HTTP requests from third-party payment gateways.
 * It strictly verifies the cryptographic signatures before trusting the payload.
 */

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // 1. Verify Signature
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
  const expectedSignature = crypto.createHmac('sha256', secret)
                                  .update(JSON.stringify(req.body))
                                  .digest('hex');
                                  
  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedSignatureBuffer = Buffer.from(receivedSignature || '', 'utf8');

  // V2 SECURITY: Prevent timing attacks using timingSafeEqual
  let isValid = false;
  if (expectedSignatureBuffer.length === receivedSignatureBuffer.length) {
    isValid = crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);
  }

  if (!isValid) {
    console.warn('[SECURITY] Invalid Razorpay signature detected');
    // Log intrusion attempt
    await admin.firestore().collection('financial_audit_logs').add({
      type: 'INVALID_SIGNATURE',
      ip: req.ip,
      payload: req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.status(401).send('Unauthorized');
  }

  // 2. Process Payload (Idempotently)
  try {
    const event = req.body.event;
    
    // Store raw webhook for audit trail regardless of processing success
    await admin.firestore().collection('gateway_transactions').add({
      provider: 'razorpay',
      eventId: req.body.contains ? req.body.contains.id : null,
      rawPayload: req.body,
      signatureVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      // The notes object typically stores our internal reference ID during intent creation
      const internalPaymentId = paymentEntity.notes.internal_payment_id; 
      
      if (!internalPaymentId) {
         return res.status(400).send('Missing internal payment routing ID');
      }

      const db = admin.firestore();
      const paymentData = await PaymentService.processSuccessfulPayment(db, internalPaymentId);
      
      // Fire Event Bus
      await EventPublisher.publish('PaymentSucceeded', { 
        paymentId: internalPaymentId, 
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        provider: 'razorpay',
        gatewayId: paymentEntity.id
      });
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[CRITICAL] Webhook processing error:', err);
    
    // V2 ERROR HANDLING: Distinguish between bad requests and internal server errors.
    // Return 500 for our faults so the gateway retries the webhook, preventing data loss.
    if (err.message === 'Payment not found') {
        return res.status(200).send('Ignored: Unknown payment');
    }
    
    return res.status(500).send('Internal Server Error');
  }
});
