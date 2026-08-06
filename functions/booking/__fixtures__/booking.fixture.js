const { BOOKING_STATES } = require('../BookingStateMachine');

const mockGuideId = 'guide_123';
const mockUserId = 'user_456';
const mockAdminId = 'admin_789';

const createBookingFixture = (overrides = {}) => ({
  guideId: mockGuideId,
  serviceId: 'service_abc',
  date: '2026-10-15',
  time: '14:00',
  ...overrides
});

const existingBookingFixture = (status = BOOKING_STATES.REQUESTED, overrides = {}) => ({
  id: 'booking_001',
  userId: mockUserId,
  guideId: mockGuideId,
  status: status,
  paymentStatus: 'pending',
  ...overrides
});

module.exports = {
  mockGuideId,
  mockUserId,
  mockAdminId,
  createBookingFixture,
  existingBookingFixture
};
