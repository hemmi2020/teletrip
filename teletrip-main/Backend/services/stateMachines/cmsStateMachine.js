/**
 * CMS Content State Machine
 * Enforces valid state transitions for destinations, offers, banners, and pages
 */

const AdminActivity = require('../../models/adminactivity.model');

const CMS_STATES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

const VALID_CMS_TRANSITIONS = {
  [CMS_STATES.DRAFT]: [CMS_STATES.SCHEDULED, CMS_STATES.PUBLISHED, CMS_STATES.ARCHIVED],
  [CMS_STATES.SCHEDULED]: [CMS_STATES.PUBLISHED, CMS_STATES.DRAFT, CMS_STATES.ARCHIVED],
  [CMS_STATES.PUBLISHED]: [CMS_STATES.ARCHIVED, CMS_STATES.DRAFT],
  [CMS_STATES.ARCHIVED]: [CMS_STATES.DRAFT, CMS_STATES.PUBLISHED]
};

function canTransitionCMS(currentState, targetState) {
  if (!currentState || !targetState) return false;
  const normalizedCurrent = currentState.toLowerCase();
  const normalizedTarget = targetState.toLowerCase();

  if (normalizedCurrent === normalizedTarget) return true;
  const allowed = VALID_CMS_TRANSITIONS[normalizedCurrent] || [];
  return allowed.includes(normalizedTarget);
}

module.exports = {
  CMS_STATES,
  VALID_CMS_TRANSITIONS,
  canTransitionCMS
};
