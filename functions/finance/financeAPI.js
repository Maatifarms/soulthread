const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { PaymentService } = require('./PaymentService');
const { createPaymentSchema, recordCashPaymentSchema } = require('./financeSchema');

exports.createPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = createPaymentSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  
  // 1. Fetch booking to derive amounts (Zero Trust UI)
  const bookingSnap = await db.collection('bookings').doc(value.bookingId).get();
  if (!bookingSnap.exists) throw new functions.https.HttpsError('not-found', 'Booking not found');
  const bookingData = bookingSnap.data();

  // Assuming booking has priceFinal calculated and stored
  const amountToCharge = bookingData.priceFinal || 1500; 

  try {
    const paymentId = await PaymentService.createPaymentIntent(
      db, 
      value.bookingId, 
      context.auth.uid, 
      bookingData.guideId, 
      amountToCharge
    );
    
    // In a real app, this would return the Razorpay Order ID or Stripe Client Secret
    return { success: true, paymentId, amount: amountToCharge };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.recordCashPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  // Usually restricted to guides or admins
  if (context.auth.token.role !== 'guide' && context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized to record cash payments');
  }

  const { error, value } = recordCashPaymentSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  const bookingSnap = await db.collection('bookings').doc(value.bookingId).get();
  if (!bookingSnap.exists) throw new functions.https.HttpsError('not-found', 'Booking not found');
  const bookingData = bookingSnap.data();

  const amountToCharge = bookingData.priceFinal || 1500; 

  try {
    const paymentId = await PaymentService.recordCashPayment(db, value.bookingId, context.auth.uid, amountToCharge);
    return { success: true, paymentId };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});
