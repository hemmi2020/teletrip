/**
 * Frontend State Machine Specifications
 * Provides type-safe status definitions, badges, and valid transition action maps
 */

export const BOOKING_STATES = {
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

export const BOOKING_STATUS_CONFIG = {
  [BOOKING_STATES.PENDING]: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    allowedTransitions: ['confirmed', 'cancelled', 'on_hold', 'expired'],
    actions: [
      { id: 'confirm', label: 'Confirm Booking', targetStatus: 'confirmed', variant: 'primary' },
      { id: 'cancel', label: 'Cancel Booking', targetStatus: 'cancelled', variant: 'destructive' }
    ]
  },
  [BOOKING_STATES.ON_HOLD]: {
    label: 'On Hold',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    allowedTransitions: ['confirmed', 'cancelled', 'expired'],
    actions: [
      { id: 'confirm', label: 'Release & Confirm', targetStatus: 'confirmed', variant: 'primary' },
      { id: 'cancel', label: 'Cancel Booking', targetStatus: 'cancelled', variant: 'destructive' }
    ]
  },
  [BOOKING_STATES.CONFIRMED]: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    allowedTransitions: ['modified', 'cancellation_requested', 'cancelled', 'completed'],
    actions: [
      { id: 'request_cancel', label: 'Request Cancellation', targetStatus: 'cancellation_requested', variant: 'outline' },
      { id: 'cancel', label: 'Direct Cancel', targetStatus: 'cancelled', variant: 'destructive' }
    ]
  },
  [BOOKING_STATES.MODIFIED]: {
    label: 'Modified',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    allowedTransitions: ['confirmed', 'cancellation_requested', 'cancelled', 'completed'],
    actions: [
      { id: 'confirm', label: 'Re-Confirm', targetStatus: 'confirmed', variant: 'primary' },
      { id: 'cancel', label: 'Cancel', targetStatus: 'cancelled', variant: 'destructive' }
    ]
  },
  [BOOKING_STATES.CANCELLATION_REQUESTED]: {
    label: 'Cancel Requested',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    allowedTransitions: ['cancelled', 'confirmed'],
    actions: [
      { id: 'approve_cancel', label: 'Approve & Cancel', targetStatus: 'cancelled', variant: 'destructive' },
      { id: 'reject_cancel', label: 'Reject & Keep Confirmed', targetStatus: 'confirmed', variant: 'outline' }
    ]
  },
  [BOOKING_STATES.CANCELLED]: {
    label: 'Cancelled',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    allowedTransitions: ['refund_pending', 'refunded'],
    actions: [
      { id: 'process_refund', label: 'Process Refund', targetStatus: 'refund_pending', variant: 'primary' }
    ]
  },
  [BOOKING_STATES.REFUND_PENDING]: {
    label: 'Refund Pending',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    allowedTransitions: ['refunded', 'cancelled'],
    actions: [
      { id: 'complete_refund', label: 'Complete Refund', targetStatus: 'refunded', variant: 'primary' }
    ]
  },
  [BOOKING_STATES.REFUNDED]: {
    label: 'Refunded',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    allowedTransitions: [],
    actions: []
  },
  [BOOKING_STATES.COMPLETED]: {
    label: 'Completed',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    allowedTransitions: [],
    actions: []
  },
  [BOOKING_STATES.EXPIRED]: {
    label: 'Expired',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    allowedTransitions: [],
    actions: []
  }
};

export const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  processing: {
    label: 'Processing',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  completed: {
    label: 'Paid',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  failed: {
    label: 'Failed',
    badgeClass: 'bg-red-50 text-red-700 border-red-200'
  },
  refunded: {
    label: 'Refunded',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  partially_refunded: {
    label: 'Partially Refunded',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  partially_refunded: 'bg-purple-50 text-purple-700 border-purple-200',
  refund_pending: 'bg-purple-50 text-purple-700 border-purple-200',
  disputed: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200'
};

export function getBookingStatusConfig(status) {
  const norm = (status || 'pending').toLowerCase();
  return BOOKING_STATUS_CONFIG[norm] || {
    label: status || 'Unknown',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    allowedTransitions: [],
    actions: []
  };
}

export function getPaymentStatusConfig(status) {
  const norm = (status || 'pending').toLowerCase();
  return PAYMENT_STATUS_CONFIG[norm] || {
    label: status || 'Unknown',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
  };
}
