const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  UPCOMING: 'upcoming',
  ACTIVE: 'active'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  COMPLETED: 'completed'
};

const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Bank Transfer',
  HBLPAY: 'HBLPay',
  PAY_ON_SITE: 'Pay on Site',
  REFUND: 'Refund'
};

const BOARD_TYPES = {
  ROOM_ONLY: 'Room Only',
  BED_AND_BREAKFAST: 'Bed & Breakfast',
  HALF_BOARD: 'Half Board',
  FULL_BOARD: 'Full Board',
  ALL_INCLUSIVE: 'All Inclusive',
  SELF_CATERING: 'Self Catering'
};

const BOARD_CODE_MAP = {
  RO: 'Room Only',
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  AI: 'All Inclusive',
  SC: 'Self Catering'
};

const RATE_CLASSES = {
  NOR: 'NOR', // Normal
  NRF: 'NRF', // Non-refundable
  PRE: 'PRE'  // Prepaid
};

const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin'
};

const EMAIL_TYPES = {
  BOOKING_CONFIRMATION: 'bookingConfirmation',
  BOOKING_CANCELLATION: 'bookingCancellation',
  PAYMENT_CONFIRMATION: 'paymentConfirmation',
  PASSWORD_RESET: 'passwordReset'
};

module.exports = {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  BOARD_TYPES,
  BOARD_CODE_MAP,
  RATE_CLASSES,
  USER_ROLES,
  EMAIL_TYPES
};