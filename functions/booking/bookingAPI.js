const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { createBookingSchema, transitionBookingSchema } = require('./bookingSchema');
const { BookingDomainService } = require('./BookingDomainService');
const { Logger } = require('../system/Logger');
const { AppError } = require('../system/AppError');

function mapDomainError(err) {
  if (err.message === 'NOT_FOUND') return AppError.NotFound('Booking not found');
  if (err.message === 'PERMISSION_DENIED') return AppError.PermissionDenied('Not authorized');
  return new AppError('INTERNAL', err.message, 500);
}

function handleApiError(err, correlationId) {
  if (err.name === 'AppError') {
    Logger.warn('Operational Error', { correlationId, code: err.code, status: err.httpStatus }, err);
    throw new functions.https.HttpsError(
      err.httpStatus === 404 ? 'not-found' : 
      err.httpStatus === 403 ? 'permission-denied' : 
      err.httpStatus === 400 ? 'invalid-argument' : 'internal', 
      err.message
    );
  }
  
  Logger.error('Unhandled Exception', { correlationId }, err);
  throw new functions.https.HttpsError('internal', 'An unexpected error occurred');
}

exports.createBooking = functions.https.onCall(async (data, context) => {
  const correlationId = context.rawRequest?.headers['x-request-id'] || `req-${Date.now()}`;
  Logger.info('Received createBooking request', { correlationId });

  const { error, value } = createBookingSchema.validate(data);
  if (error) {
    return handleApiError(AppError.BadRequest(error.message), correlationId);
  }
  
  try {
    const actorId = context.auth ? context.auth.uid : 'guest';
    const bookingId = await BookingDomainService.createBooking(value, actorId);
    
    Logger.info('Booking created successfully', { correlationId, bookingId, actorId });
    return { bookingId };
  } catch (err) {
    handleApiError(mapDomainError(err), correlationId);
  }
});

exports.acceptBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = transitionBookingSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  try {
    const actorRole = context.auth.token.role || 'user';
    await BookingDomainService.acceptBooking(value.bookingId, context.auth.uid, actorRole);
    return { success: true };
  } catch (err) {
    throw mapDomainError(err);
  }
});

exports.rejectBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = transitionBookingSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  try {
    const actorRole = context.auth.token.role || 'user';
    await BookingDomainService.rejectBooking(value.bookingId, context.auth.uid, actorRole, value.reason);
    return { success: true };
  } catch (err) {
    throw mapDomainError(err);
  }
});

exports.cancelBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = transitionBookingSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  try {
    const actorRole = context.auth.token.role || 'user';
    await BookingDomainService.cancelBooking(value.bookingId, context.auth.uid, actorRole, value.reason);
    return { success: true };
  } catch (err) {
    throw mapDomainError(err);
  }
});

exports.checkIn = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  
  const { bookingId } = data;
  if (!bookingId) throw new functions.https.HttpsError('invalid-argument', 'bookingId is required');

  try {
    const isSessionReady = await BookingDomainService.checkIn(bookingId, context.auth.uid);
    return { success: true, inSession: isSessionReady };
  } catch (err) {
    throw mapDomainError(err);
  }
});
