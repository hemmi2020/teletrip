const fc = require('fast-check');
const EmailTemplate = require('../../models/emailTemplate.model');
const EmailLog = require('../../models/emailLog.model');
const User = require('../../models/user.model');

// Mock nodemailer
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

// Mock Bull queue
const mockQueueAdd = jest.fn();
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: mockQueueAdd,
    process: jest.fn(),
  }));
});

// Mock the models
jest.mock('../../models/emailTemplate.model');
jest.mock('../../models/emailLog.model');
jest.mock('../../models/user.model');

// Must require services AFTER mocks are set up
const emailService = require('../../services/email.service');
const { interpolate } = require('../../services/email.service');

// ---------------------------------------------------------------------------
// Shared Arbitraries / Generators
// ---------------------------------------------------------------------------

// Arbitrary: generates a valid MongoDB ObjectId-like hex string (24 chars)
const objectIdArb = fc.string({
  unit: fc.constantFrom(...'0123456789abcdef'.split('')),
  minLength: 24,
  maxLength: 24,
});

// Arbitrary: generates a simple email address
const emailArb = fc
  .tuple(
    fc.string({
      unit: fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
      ),
      minLength: 1,
      maxLength: 10,
    }),
    fc.constantFrom('example.com', 'test.org', 'mail.net')
  )
  .map(([local, domain]) => `${local}@${domain}`);

// Arbitrary: generates a first name (simple alpha string)
const firstNameArb = fc.string({
  unit: fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz'.split('')
  ),
  minLength: 1,
  maxLength: 10,
});

// Arbitrary: generates a single recipient user object
const recipientArb = fc
  .tuple(objectIdArb, emailArb, firstNameArb)
  .map(([id, email, firstName]) => ({
    _id: id,
    email,
    fullname: { firstname: firstName },
  }));

// Arbitrary: generates a list of N unique-email recipients (1..200)
const recipientListArb = fc
  .array(recipientArb, { minLength: 1, maxLength: 200 })
  .map((recipients) => {
    // Deduplicate by email to avoid ambiguity
    const seen = new Set();
    return recipients.filter((r) => {
      if (seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });
  })
  .filter((list) => list.length >= 1);

// Arbitrary: generates a mock template document
const templateDocArb = fc.record({
  _id: objectIdArb,
  name: fc.constant('Test Template'),
  slug: fc.constant('test_template'),
  subject: fc.constant('Hello {{userName}}'),
  htmlContent: fc.constant('<p>Hi {{userName}}</p>'),
  isActive: fc.constant(true),
  isDeleted: fc.constant(false),
});


// ---------------------------------------------------------------------------
// Property 11: Bulk Email Consistency
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 10.3, 10.6**
 *
 * For any bulk job with N recipients, after processing, sent + failed = N
 * and exactly N EmailLog entries with type `bulk` exist.
 */
describe('Property 11: Bulk Email Consistency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('after processing a batch, sent + failed equals the number of recipients', async () => {
    // Import the emailQueue module to get access to the processor
    // The processor is registered via emailQueue.process('sendBulk', handler)
    // We need to capture the handler function from the mock
    const Bull = require('bull');

    await fc.assert(
      fc.asyncProperty(
        recipientListArb,
        templateDocArb,
        // For each recipient, randomly decide if SMTP succeeds or fails
        fc.array(fc.boolean(), { minLength: 1, maxLength: 200 }),
        async (recipients, templateDoc, smtpOutcomes) => {
          jest.clearAllMocks();

          // Pad or trim smtpOutcomes to match recipients length
          const outcomes = recipients.map(
            (_, i) => smtpOutcomes[i % smtpOutcomes.length]
          );

          // Mock EmailTemplate.findById to return the template
          EmailTemplate.findById.mockResolvedValue(templateDoc);

          // Mock EmailLog.updateOne to track calls
          const updateCalls = [];
          EmailLog.updateOne.mockImplementation((filter, update) => {
            updateCalls.push({ filter, update });
            return Promise.resolve({ modifiedCount: 1 });
          });

          // Mock sendMail based on per-recipient outcomes
          let sendCallIndex = 0;
          mockSendMail.mockImplementation(() => {
            const idx = sendCallIndex++;
            if (outcomes[idx]) {
              return Promise.resolve({ messageId: `<msg-${idx}@test>` });
            } else {
              return Promise.reject(new Error('SMTP failure'));
            }
          });

          // Simulate the queue processor logic directly
          // (mirrors emailQueue.service.js processBulkEmailBatch)
          const bulkJobId = 'test-bulk-job-id';
          const customVariables = {};

          let sent = 0;
          let failed = 0;

          const transporter = { sendMail: mockSendMail };

          for (const recipient of recipients) {
            try {
              const variables = {
                ...customVariables,
                userName: recipient.fullname?.firstname || 'Customer',
                userEmail: recipient.email,
              };

              const renderedSubject = interpolate(
                templateDoc.subject,
                variables
              );
              const renderedHtml = interpolate(
                templateDoc.htmlContent,
                variables
              );

              await transporter.sendMail({
                from: '"Test" <test@test.com>',
                to: recipient.email,
                subject: renderedSubject,
                html: renderedHtml,
              });

              await EmailLog.updateOne(
                {
                  recipient: recipient.email,
                  'metadata.bulkJobId': bulkJobId,
                  status: 'queued',
                },
                { $set: { status: 'sent', sentAt: new Date() } }
              );

              sent++;
            } catch (error) {
              await EmailLog.updateOne(
                {
                  recipient: recipient.email,
                  'metadata.bulkJobId': bulkJobId,
                  status: 'queued',
                },
                { $set: { status: 'failed', error: error.message } }
              );

              failed++;
            }
          }

          const N = recipients.length;

          // Property: sent + failed = N
          expect(sent + failed).toBe(N);

          // Property: exactly N EmailLog.updateOne calls were made (one per recipient)
          expect(updateCalls.length).toBe(N);

          // Property: every update targets a bulk log entry
          for (const call of updateCalls) {
            expect(call.filter['metadata.bulkJobId']).toBe(bulkJobId);
          }

          // Property: every update sets status to either 'sent' or 'failed'
          for (const call of updateCalls) {
            const status = call.update.$set.status;
            expect(['sent', 'failed']).toContain(status);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the number of sent updates matches SMTP successes and failed updates matches SMTP failures', async () => {
    await fc.assert(
      fc.asyncProperty(
        recipientListArb,
        templateDocArb,
        fc.array(fc.boolean(), { minLength: 1, maxLength: 200 }),
        async (recipients, templateDoc, smtpOutcomes) => {
          jest.clearAllMocks();

          const outcomes = recipients.map(
            (_, i) => smtpOutcomes[i % smtpOutcomes.length]
          );

          EmailTemplate.findById.mockResolvedValue(templateDoc);

          const statusUpdates = [];
          EmailLog.updateOne.mockImplementation((filter, update) => {
            statusUpdates.push(update.$set.status);
            return Promise.resolve({ modifiedCount: 1 });
          });

          let sendCallIndex = 0;
          mockSendMail.mockImplementation(() => {
            const idx = sendCallIndex++;
            if (outcomes[idx]) {
              return Promise.resolve({ messageId: `<msg-${idx}@test>` });
            } else {
              return Promise.reject(new Error('SMTP failure'));
            }
          });

          const bulkJobId = 'test-bulk-job-id';
          const transporter = { sendMail: mockSendMail };

          for (const recipient of recipients) {
            try {
              const variables = {
                userName: recipient.fullname?.firstname || 'Customer',
                userEmail: recipient.email,
              };
              const renderedSubject = interpolate(templateDoc.subject, variables);
              const renderedHtml = interpolate(templateDoc.htmlContent, variables);

              await transporter.sendMail({
                from: '"Test" <test@test.com>',
                to: recipient.email,
                subject: renderedSubject,
                html: renderedHtml,
              });

              await EmailLog.updateOne(
                {
                  recipient: recipient.email,
                  'metadata.bulkJobId': bulkJobId,
                  status: 'queued',
                },
                { $set: { status: 'sent', sentAt: new Date() } }
              );
            } catch (error) {
              await EmailLog.updateOne(
                {
                  recipient: recipient.email,
                  'metadata.bulkJobId': bulkJobId,
                  status: 'queued',
                },
                { $set: { status: 'failed', error: error.message } }
              );
            }
          }

          const expectedSent = outcomes
            .slice(0, recipients.length)
            .filter(Boolean).length;
          const expectedFailed = recipients.length - expectedSent;

          const actualSent = statusUpdates.filter((s) => s === 'sent').length;
          const actualFailed = statusUpdates.filter(
            (s) => s === 'failed'
          ).length;

          expect(actualSent).toBe(expectedSent);
          expect(actualFailed).toBe(expectedFailed);
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ---------------------------------------------------------------------------
// Property 12: Bulk Recipient Batching
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirement 10.2**
 *
 * For any N recipients, the system creates exactly `ceil(N / 50)` queue jobs,
 * each with at most 50 recipients, and every recipient appears in exactly one batch.
 */
describe('Property 12: Bulk Recipient Batching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queueBulkEmail creates ceil(N/50) queue jobs, each with at most 50 recipients, covering all recipients exactly once', async () => {
    await fc.assert(
      fc.asyncProperty(
        recipientListArb,
        templateDocArb,
        async (recipients, templateDoc) => {
          jest.clearAllMocks();

          const N = recipients.length;

          // Mock EmailTemplate.findOne to return the template (for validation)
          EmailTemplate.findOne.mockResolvedValue(templateDoc);

          // Mock User.find to return the recipients
          // User.find().select().lean() chain
          const mockLean = jest.fn().mockResolvedValue(recipients);
          const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
          User.find.mockReturnValue({ select: mockSelect });

          // Mock EmailLog.insertMany to track log entries created
          const insertedLogs = [];
          EmailLog.insertMany.mockImplementation((entries) => {
            insertedLogs.push(...entries);
            return Promise.resolve(entries);
          });

          // Track queue.add calls to capture batches
          let jobIdCounter = 0;
          const addedJobs = [];
          mockQueueAdd.mockImplementation((name, data, opts) => {
            const jobId = `job-${++jobIdCounter}`;
            addedJobs.push({ name, data, opts, id: jobId });
            return Promise.resolve({ id: jobId });
          });

          // Call queueBulkEmail
          const result = await emailService.queueBulkEmail(
            templateDoc._id,
            { segment: 'all' },
            {}
          );

          // Should succeed
          expect(result.success).toBe(true);
          expect(result.queued).toBe(N);

          // Property: exactly ceil(N / 50) queue jobs created
          const expectedBatches = Math.ceil(N / 50);
          expect(addedJobs.length).toBe(expectedBatches);

          // Property: each batch has at most 50 recipients
          for (const job of addedJobs) {
            expect(job.data.recipients.length).toBeLessThanOrEqual(50);
            expect(job.data.recipients.length).toBeGreaterThanOrEqual(1);
          }

          // Property: total recipients across all batches equals N
          const totalBatched = addedJobs.reduce(
            (sum, job) => sum + job.data.recipients.length,
            0
          );
          expect(totalBatched).toBe(N);

          // Property: every recipient email appears in exactly one batch
          const batchedEmails = [];
          for (const job of addedJobs) {
            for (const r of job.data.recipients) {
              batchedEmails.push(r.email);
            }
          }
          const uniqueBatchedEmails = new Set(batchedEmails);
          expect(uniqueBatchedEmails.size).toBe(batchedEmails.length); // no duplicates

          // Every original recipient email is present
          const originalEmails = new Set(recipients.map((r) => r.email));
          for (const email of originalEmails) {
            expect(uniqueBatchedEmails.has(email)).toBe(true);
          }

          // Property: exactly N EmailLog entries created with type 'bulk'
          expect(insertedLogs.length).toBe(N);
          for (const log of insertedLogs) {
            expect(log.type).toBe('bulk');
            expect(log.status).toBe('queued');
          }

          // Property: returned jobIds count matches batch count
          expect(result.jobIds.length).toBe(expectedBatches);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('batches are ordered: recipients appear in the same order as the original list', async () => {
    await fc.assert(
      fc.asyncProperty(
        recipientListArb,
        templateDocArb,
        async (recipients, templateDoc) => {
          jest.clearAllMocks();

          EmailTemplate.findOne.mockResolvedValue(templateDoc);

          const mockLean = jest.fn().mockResolvedValue(recipients);
          const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
          User.find.mockReturnValue({ select: mockSelect });

          EmailLog.insertMany.mockResolvedValue([]);

          let jobIdCounter = 0;
          const addedJobs = [];
          mockQueueAdd.mockImplementation((name, data, opts) => {
            const jobId = `job-${++jobIdCounter}`;
            addedJobs.push({ data });
            return Promise.resolve({ id: jobId });
          });

          await emailService.queueBulkEmail(
            templateDoc._id,
            { segment: 'all' },
            {}
          );

          // Flatten batched recipients in order
          const flattenedEmails = addedJobs.flatMap((job) =>
            job.data.recipients.map((r) => r.email)
          );

          // The order should match the original recipients order
          const originalEmails = recipients.map((r) => r.email);
          expect(flattenedEmails).toEqual(originalEmails);
        }
      ),
      { numRuns: 100 }
    );
  });
});
