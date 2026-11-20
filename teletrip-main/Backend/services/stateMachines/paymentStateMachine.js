/**
 * Payment State Machine
 * Enforces valid state transitions and writes immutable audit logs
 */

const AdminActivity = require('../../models/adminactivity.model');

const PAYMENT_STATES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUND_PENDING: 'refund_pending',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  DISPUTED: 'disputed',
  EXPIRED: 'expired'
};

const VALID_PAYMENT_TRANSITIONS = {
  [PAYMENT_STATES.PENDING]: [PAYMENT_STATES.PROCESSING, PAYMENT_STATES.COMPLETED, PAYMENT_STATES.FAILED, PAYMENT_STATES.CANCELLED, PAYMENT_STATES.EXPIRED],
  [PAYMENT_STATES.PROCESSING]: [PAYMENT_STATES.COMPLETED, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.COMPLETED]: [PAYMENT_STATES.REFUND_PENDING, PAYMENT_STATES.REFUNDED, PAYMENT_STATES.PARTIALLY_REFUNDED, PAYMENT_STATES.DISPUTED],
  [PAYMENT_STATES.REFUND_PENDING]: [PAYMENT_STATES.REFUNDED, PAYMENT_STATES.PARTIALLY_REFUNDED, PAYMENT_STATES.COMPLETED],
  [PAYMENT_STATES.PARTIALLY_REFUNDED]: [PAYMENT_STATES.REFUNDED, PAYMENT_STATES.PARTIALLY_REFUNDED],
  [PAYMENT_STATES.DISPUTED]: [PAYMENT_STATES.REFUNDED, PAYMENT_STATES.COMPLETED],
  [PAYMENT_STATES.REFUNDED]: [],  // Terminal
  [PAYMENT_STATES.FAILED]: [],    // Terminal
  [PAYMENT_STATES.CANCELLED]: [], // Terminal
  [PAYMENT_STATES.EXPIRED]: []    // Terminal
};

function canTransitionPayment(currentState, targetState) {
  if (!currentState || !targetState) return false;
  const normalizedCurrent = currentState.toLowerCase();
  const normalizedTarget = targetState.toLowerCase();

  if (normalizedCurrent === normalizedTarget) return true;
  const allowed = VALID_PAYMENT_TRANSITIONS[normalizedCurrent] || [];
  return allowed.includes(normalizedTarget);
}

async function transitionPaymentState(payment, targetState, { reason, actorId, ipAddress, userAgent, refundAmount, metadata = {} } = {}) {
  const currentState = (payment.status || 'pending').toLowerCase();
  const nextState = targetState.toLowerCase();

  if (!canTransitionPayment(currentState, nextState)) {
    const error = new Error(`Illegal payment transition from '${currentState}' to '${nextState}'`);
    error.status = 409;
    error.code = 'INVALID_PAYMENT_TRANSITION';
    throw error;
  }

  payment.status = nextState;
  
  if (refundAmount) {
    payment.refund = payment.refund || {};
    payment.refund.amount = (payment.refund.amount || 0) + Number(refundAmount);
    payment.refund.refundDate = new Date();
    payment.refund.reason = reason;
  }

  await payment.save();

  try {
    if (actorId) {
      await AdminActivity.create({
        admin: actorId,
        action: nextState === 'refunded' || nextState === 'partially_refunded' ? 'payment_refunded' : 'payment_investigated',
        target: 'payment',
        targetId: payment._id,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: {
          oldValues: { status: currentState },
          newValues: { status: nextState },
          refundAmount: refundAmount || 0,
          reason: reason || 'Payment state transition',
          ...metadata
        }
      });
    }
  } catch (logErr) {
    console.error('[AuditLogger] Failed to write payment activity log:', logErr.message);
  }

  return payment;
}

module.exports = {
  PAYMENT_STATES,
  VALID_PAYMENT_TRANSITIONS,
  canTransitionPayment,
  transitionPaymentState
};
