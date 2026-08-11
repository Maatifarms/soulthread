const admin = require('firebase-admin');
const { BookingDomainService } = require('../BookingDomainService');
const { BOOKING_STATES } = require('../BookingStateMachine');
const { mockUserId, mockGuideId, mockAdminId, createBookingFixture, existingBookingFixture } = require('../__fixtures__/booking.fixture');

// Deep mock Firebase Admin
const mockDocRef = {
  id: 'mock_booking_id',
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis()
};

const mockTransaction = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => mockDocRef)
  })),
  runTransaction: jest.fn(async (callback) => await callback(mockTransaction)),
};

jest.mock('firebase-admin', () => {
  return {
    firestore: Object.assign(
      jest.fn(() => mockDb),
      {
        FieldValue: {
          serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP')
        }
      }
    )
  };
});

describe('BookingDomainService', () => {
  let db;

  beforeEach(() => {
    jest.clearAllMocks();
    db = admin.firestore();
    // mockTransaction is now the global one, clear its mocks directly
    mockTransaction.get.mockReset();
    mockTransaction.set.mockReset();
    mockTransaction.update.mockReset();
    db.runTransaction.mockImplementation(async (cb) => cb(mockTransaction));
  });

  describe('createBooking', () => {
    it('should assign the requested actorId and initialize the correct state', async () => {
      const payload = createBookingFixture();
      
      const bookingId = await BookingDomainService.createBooking(payload, mockUserId);
      
      expect(bookingId).toBe('mock_booking_id');

      // Initial booking write: Booking, Audit, Event (3 sets). TEST MODE then
      // walks REQUESTED -> ACCEPTED -> AWAITING_PAYMENT -> PAYMENT_SUCCESSFUL
      // -> CONFIRMED via the real BookingStateMachine, each transition adding
      // its own audit_log + booking_event set (2 sets each) — see
      // BookingDomainService.createBooking's TEST MODE block.
      expect(mockTransaction.set).toHaveBeenCalledTimes(3 + 4 * 2);

      const bookingPayload = mockTransaction.set.mock.calls[0][1];
      expect(bookingPayload.userId).toBe(mockUserId);
      expect(bookingPayload.status).toBe(BOOKING_STATES.REQUESTED);
      expect(bookingPayload.bookingNumber).toMatch(/^ST-\d{5}$/);

      // TEST MODE: the booking should end up CONFIRMED (not stuck at REQUESTED),
      // since no real guide-acceptance/payment flow exists yet to move it there.
      const updateCalls = mockTransaction.update.mock.calls;
      const lastStatusUpdate = updateCalls[updateCalls.length - 1][1];
      expect(lastStatusUpdate.status).toBe(BOOKING_STATES.CONFIRMED);
    });
  });

  describe('cancelBooking', () => {
    it('should assign CANCELLED_BY_USER if actor is the patient', async () => {
      const booking = existingBookingFixture(BOOKING_STATES.REQUESTED);
      mockTransaction.get.mockResolvedValue({ exists: true, data: () => booking });

      await BookingDomainService.cancelBooking('booking_1', mockUserId, 'user', 'Changed mind');
      
      const updatePayload = mockTransaction.update.mock.calls[0][1];
      expect(updatePayload.status).toBe(BOOKING_STATES.CANCELLED_BY_USER);
    });

    it('should assign CANCELLED_BY_GUIDE if actor is the guide', async () => {
      const booking = existingBookingFixture(BOOKING_STATES.CONFIRMED);
      mockTransaction.get.mockResolvedValue({ exists: true, data: () => booking });

      await BookingDomainService.cancelBooking('booking_1', mockGuideId, 'guide', 'Unavailable');
      
      const updatePayload = mockTransaction.update.mock.calls[0][1];
      expect(updatePayload.status).toBe(BOOKING_STATES.CANCELLED_BY_GUIDE);
    });

    it('should assign CANCELLED_BY_ADMIN if actor is an admin', async () => {
      const booking = existingBookingFixture(BOOKING_STATES.CONFIRMED);
      mockTransaction.get.mockResolvedValue({ exists: true, data: () => booking });

      await BookingDomainService.cancelBooking('booking_1', mockAdminId, 'admin', 'Violation');
      
      const updatePayload = mockTransaction.update.mock.calls[0][1];
      expect(updatePayload.status).toBe(BOOKING_STATES.CANCELLED_BY_ADMIN);
    });

    it('should throw PERMISSION_DENIED if actor is unrelated', async () => {
      const booking = existingBookingFixture(BOOKING_STATES.REQUESTED);
      mockTransaction.get.mockResolvedValue({ exists: true, data: () => booking });

      await expect(
        BookingDomainService.cancelBooking('booking_1', 'random_guy', 'user', 'Hack')
      ).rejects.toThrow('PERMISSION_DENIED');
    });
  });

  describe('checkIn', () => {
    it('should transition to USER_CHECKED_IN if patient checks in first', async () => {
      const booking = existingBookingFixture(BOOKING_STATES.CONFIRMED);
      mockTransaction.get.mockResolvedValue({ exists: true, data: () => booking });

      const isReady = await BookingDomainService.checkIn('booking_1', mockUserId);
      
      const updatePayload = mockTransaction.update.mock.calls[0][1];
      expect(updatePayload.status).toBe(BOOKING_STATES.USER_CHECKED_IN);
      expect(isReady).toBe(false);
    });

    it('should transition to IN_SESSION if guide checks in after patient', async () => {
      const booking = existingBookingFixture(BOOKING_STATES.USER_CHECKED_IN);
      mockTransaction.get.mockResolvedValue({ exists: true, data: () => booking });

      const isReady = await BookingDomainService.checkIn('booking_1', mockGuideId);
      
      const updatePayload = mockTransaction.update.mock.calls[0][1];
      expect(updatePayload.status).toBe(BOOKING_STATES.IN_SESSION);
      expect(isReady).toBe(true); // Session can start!
    });
  });
});
