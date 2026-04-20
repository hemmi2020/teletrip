const fc = require('fast-check');
const EmailTemplate = require('../../models/emailTemplate.model');
const EmailLog = require('../../models/emailLog.model');

// Mock nodemailer
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail
  })
}));

// Mock the models
jest.mock('../../models/emailTemplate.model');
jest.mock('../../models/emailLog.model');

const emailService = require('../../services/email.service');

/**
 * Property-Based Tests for Log Completeness
 *
 * Tests Property 10 from the design document.
 *
 * **Validates: Requirement 2.1**
 *
 * For any call to sendTemplatedEmail() that reaches the send phase
 * (template resolved successfully), exactly one EmailLog document is
 * created regardless of whether the SMTP send succeeds or fails.
 */

// ---------------------------------------------------------------------------
// Arbitraries / Generators
// ---------------------------------------------------------------------------

// Arbitrary: generates valid template slugs matching [a-z0-9_]+
const slugArb = fc.string({
  unit: fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz0123456789_'.split('')
  ),
  minLength: 1,
  maxLength: 20
});

// Arbitrary: generates a simple email address
const emailArb = fc.tuple(
  fc.string({
    unit: fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
    ),
    minLength: 1,
    maxLength: 10
  }),
  fc.constantFrom('example.com', 'test.org', 'mail.net')
).map(([local, domain]) => `${local}@${domain}`);

// Arbitrary: generates a variables object with safe string values
const variablesArb = fc.dictionary(
  fc.string({
    unit: fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyz'.split('')
    ),
    minLength: 1,
    maxLength: 10
  }),
  fc.string({ minLength: 0, maxLength: 30 }),
  { minKeys: 0, maxKeys: 5 }
);

// Arbitrary: generates a mock template document (always found — reaches send phase)
const templateDocArb = fc.record({
  _id: fc.string({
    unit: fc.constantFrom(...'0123456789abcdef'.split('')),
    minLength: 24,
    maxLength: 24
  }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  subject: fc.string({ minLength: 0, maxLength: 100 }),
  htmlContent: fc.string({ minLength: 0, maxLength: 200 }),
  isActive: fc.constant(true),
  isDeleted: fc.constant(false)
});

// Arbitrary: whether SMTP succeeds or fails
const smtpOutcomeArb = fc.boolean();

// ---------------------------------------------------------------------------
// Property 10: Log Completeness
// ---------------------------------------------------------------------------

describe('Property 10: Log Completeness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    EmailLog.create.mockResolvedValue({});
    EmailTemplate.updateOne.mockResolvedValue({});
  });

  /**
   * **Validates: Requirement 2.1**
   *
   * For any call to sendTemplatedEmail() that reaches the send phase
   * (template found), exactly one EmailLog document is created regardless
   * of SMTP success or failure.
   */
  it('creates exactly one EmailLog document when template is found, regardless of SMTP outcome', async () => {
    await fc.assert(
      fc.asyncProperty(
        slugArb,
        emailArb,
        variablesArb,
        templateDocArb,
        smtpOutcomeArb,
        async (slug, recipientEmail, variables, templateDoc, smtpSucceeds) => {
          jest.clearAllMocks();
          EmailLog.create.mockResolvedValue({});
          EmailTemplate.updateOne.mockResolvedValue({});

          // Template is always found (reaches the send phase)
          const template = { ...templateDoc, slug };
          EmailTemplate.findOne.mockResolvedValue(template);

          if (smtpSucceeds) {
            mockSendMail.mockResolvedValue({ messageId: `<msg-${slug}@smtp.test>` });
          } else {
            mockSendMail.mockRejectedValue(new Error('SMTP failure'));
          }

          await emailService.sendTemplatedEmail(slug, recipientEmail, variables);

          // Exactly one EmailLog.create call
          expect(EmailLog.create).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('the created EmailLog has status "sent" on SMTP success', async () => {
    await fc.assert(
      fc.asyncProperty(
        slugArb,
        emailArb,
        variablesArb,
        templateDocArb,
        async (slug, recipientEmail, variables, templateDoc) => {
          jest.clearAllMocks();
          EmailLog.create.mockResolvedValue({});
          EmailTemplate.updateOne.mockResolvedValue({});

          const template = { ...templateDoc, slug };
          EmailTemplate.findOne.mockResolvedValue(template);
          mockSendMail.mockResolvedValue({ messageId: '<msg@smtp.test>' });

          await emailService.sendTemplatedEmail(slug, recipientEmail, variables);

          expect(EmailLog.create).toHaveBeenCalledTimes(1);
          expect(EmailLog.create).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'sent' })
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('the created EmailLog has status "failed" on SMTP failure', async () => {
    await fc.assert(
      fc.asyncProperty(
        slugArb,
        emailArb,
        variablesArb,
        templateDocArb,
        async (slug, recipientEmail, variables, templateDoc) => {
          jest.clearAllMocks();
          EmailLog.create.mockResolvedValue({});
          EmailTemplate.updateOne.mockResolvedValue({});

          const template = { ...templateDoc, slug };
          EmailTemplate.findOne.mockResolvedValue(template);
          mockSendMail.mockRejectedValue(new Error('Connection refused'));

          await emailService.sendTemplatedEmail(slug, recipientEmail, variables);

          expect(EmailLog.create).toHaveBeenCalledTimes(1);
          expect(EmailLog.create).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed' })
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('no EmailLog is created when template is not found (does not reach send phase)', async () => {
    // Use a prefix that avoids matching any hardcoded default template key
    // or Object prototype properties (e.g., constructor, toString, etc.)
    const nonExistentSlugArb = fc.string({
      unit: fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
      ),
      minLength: 3,
      maxLength: 15
    }).map(s => `zzznoexist_${s}`);

    await fc.assert(
      fc.asyncProperty(
        nonExistentSlugArb,
        emailArb,
        variablesArb,
        async (slug, recipientEmail, variables) => {
          jest.clearAllMocks();
          EmailLog.create.mockResolvedValue({});

          // No DB template and no hardcoded default for this slug
          EmailTemplate.findOne.mockResolvedValue(null);

          const result = await emailService.sendTemplatedEmail(slug, recipientEmail, variables);

          // Template not found — should not reach send phase
          expect(result.success).toBe(false);
          expect(mockSendMail).not.toHaveBeenCalled();
          expect(EmailLog.create).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 200 }
    );
  });
});
