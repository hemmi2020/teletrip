/**
 * Booking State Machine
 * Enforces valid state transitions and writes immutable audit logs
 */

const AdminActivity = require('../../models/adminactivity.model');

const BOOKING_STATES = {
  DRAFT: 'draft',
  QUOTED: 'quoted',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  MODIFIED: 'modified',
  CANCELLATION_REQUESTED: 'cancellation_requested',
  CANCELLED: 'cancelled',
  REFUND_PENDING: 'refund_pending',
  REFUNDED: 'refunded',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  ON_HOLD: 'on_hold'
};

const VALID_BOOKING_TRANSITIONS = {
  [BOOKING_STATES.DRAFT]: [BOOKING_STATES.QUOTED, BOOKING_STATES.EXPIRED],
  [BOOKING_STATES.QUOTED]: [BOOKING_STATES.PENDING, BOOKING_STATES.EXPIRED],
  [BOOKING_STATES.PENDING]: [BOOKING_STATES.CONFIRMED, BOOKING_STATES.CANCELLED, BOOKING_STATES.EXPIRED, BOOKING_STATES.ON_HOLD],
  [BOOKING_STATES.ON_HOLD]: [BOOKING_STATES.CONFIRMED, BOOKING_STATES.CANCELLED, BOOKING_STATES.EXPIRED],
  [BOOKING_STATES.CONFIRMED]: [BOOKING_STATES.MODIFIED, BOOKING_STATES.CANCELLATION_REQUESTED, BOOKING_STATES.CANCELLED, BOOKING_STATES.COMPLETED],
  [BOOKING_STATES.MODIFIED]: [BOOKING_STATES.CONFIRMED, BOOKING_STATES.CANCELLATION_REQUESTED, BOOKING_STATES.CANCELLED, BOOKING_STATES.COMPLETED],
  [BOOKING_STATES.CANCELLATION_REQUESTED]: [BOOKING_STATES.CANCELLED, BOOKING_STATES.CONFIRMED],
  [BOOKING_STATES.CANCELLED]: [BOOKING_STATES.REFUND_PENDING, BOOKING_STATES.REFUNDED],
  [BOOKING_STATES.REFUND_PENDING]: [BOOKING_STATES.REFUNDED, BOOKING_STATES.CANCELLED],
  [BOOKING_STATES.REFUNDED]: [], // Terminal state
  [BOOKING_STATES.COMPLETED]: [], // Terminal state
  [BOOKING_STATES.EXPIRED]: []    // Terminal state
};

/**
 * Checks if a transition from currentState to targetState is valid
 */
function canTransitionBooking(currentState, targetState) {
  if (!currentState || !targetState) return false;
  const normalizedCurrent = currentState.toLowerCase();
  const normalizedTarget = targetState.toLowerCase();

  if (normalizedCurrent === normalizedTarget) return true; // Idempotent
  const allowed = VALID_BOOKING_TRANSITIONS[normalizedCurrent] || [];
  return allowed.includes(normalizedTarget);
}

/**
 * Executes a valid transition on a booking document and logs to audit trail
 */
async function transitionBookingState(booking, targetState, { reason, actorId, ipAddress, userAgent, metadata = {} } = {}) {
  const currentState = (booking.status || 'pending').toLowerCase();
  const nextState = targetState.toLowerCase();

  if (!canTransitionBooking(currentState, nextState)) {
    const error = new Error(`Illegal state transition from '${currentState}' to '${nextState}'`);
    error.status = 409;
    error.code = 'INVALID_STATE_TRANSITION';
    throw error;
  }

  // Update booking state
  booking.status = nextState;
  
  if (!booking.statusHistory) {
    booking.statusHistory = [];
  }
  
  booking.statusHistory.push({
    from: currentState,
    to: nextState,
    timestamp: new Date(),
    reason: reason || 'State transition executed',
    actorId: actorId || null
  });

  await booking.save();

  // Write immutable audit log
  try {
    if (actorId) {
      await AdminActivity.create({
        admin: actorId,
        action: nextState === 'cancelled' ? 'booking_cancelled' : (nextState === 'refunded' ? 'booking_refunded' : 'booking_updated'),
        target: 'booking',
        targetId: booking._id,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: {
          oldValues: { status: currentState },
          newValues: { status: nextState },
          reason: reason || 'Status transition',
          ...metadata
        }
      });
    }
  } catch (logErr) {
    console.error('[AuditLogger] Failed to write admin activity log:', logErr.message);
  }

  return booking;
}

module.exports = {
  BOOKING_STATES,
  VALID_BOOKING_TRANSITIONS,
  canTransitionBooking,
  transitionBookingState
};
