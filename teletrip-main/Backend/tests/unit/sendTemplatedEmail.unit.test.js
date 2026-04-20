const EmailTemplate = require('../../models/emailTemplate.model');
const EmailLog = require('../../models/emailLog.model');

// Mock the models
jest.mock('../../models/emailTemplate.model');
jest.mock('../../models/emailLog.model');

// Mock nodemailer
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail
  })
}));

const emailService = require('../../services/email.service');

describe('sendTemplatedEmail()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    EmailLog.create.mockResolvedValue({});
    EmailTemplate.updateOne.mockResolvedValue({});
  });

  // --- Requirement 5.1: Resolve template, interpolate, send, and log ---

  it('should resolve template, interpolate variables, send via SMTP, and log the result', async () => {
    const mockTemplate = {
      _id: 'tmpl123',
      slug: 'booking_confirmation',
      name: 'Booking Confirmation',
      subject: 'Booking Confirmed - {{bookingReference}}',
      htmlContent: '<p>Hi {{userName}}, your booking {{bookingReference}} is confirmed.</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockResolvedValue({ messageId: '<msg-001@smtp.test>' });

    const result = await emailService.sendTemplatedEmail(
      'booking_confirmation',
      'user@example.com',
      { userName: 'Ahmed', bookingReference: 'TT-2025-001' }
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('<msg-001@smtp.test>');

    // Verify sendMail was called with interpolated content
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Booking Confirmed - TT-2025-001',
        html: '<p>Hi Ahmed, your booking TT-2025-001 is confirmed.</p>'
      })
    );
  });

  // --- Requirement 5.2: Return { success: true, messageId } and create EmailLog with status 'sent' ---

  it('should return { success: true, messageId } and create EmailLog with status sent on success', async () => {
    const mockTemplate = {
      _id: 'tmpl123',
      slug: 'welcome',
      name: 'Welcome',
      subject: 'Welcome {{firstName}}',
      htmlContent: '<p>Hello {{firstName}}</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockResolvedValue({ messageId: '<msg-002@smtp.test>' });

    const result = await emailService.sendTemplatedEmail(
      'welcome',
      'new@example.com',
      { firstName: 'Sara' }
    );

    expect(result).toEqual({ success: true, messageId: '<msg-002@smtp.test>' });

    expect(EmailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        templateSlug: 'welcome',
        templateName: 'Welcome',
        recipient: 'new@example.com',
        subject: 'Welcome Sara',
        status: 'sent',
        type: 'transactional',
        messageId: '<msg-002@smtp.test>',
        metadata: { variables: { firstName: 'Sara' } }
      })
    );
  });

  // --- Requirement 5.3: Return { success: false, error } and create EmailLog with status 'failed' on SMTP failure ---

  it('should return { success: false, error } and create EmailLog with status failed on SMTP error', async () => {
    const mockTemplate = {
      _id: 'tmpl123',
      slug: 'welcome',
      name: 'Welcome',
      subject: 'Welcome {{firstName}}',
      htmlContent: '<p>Hello {{firstName}}</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockRejectedValue(new Error('SMTP connection refused'));

    const result = await emailService.sendTemplatedEmail(
      'welcome',
      'user@example.com',
      { firstName: 'Ali' }
    );

    expect(result).toEqual({ success: false, error: 'SMTP connection refused' });

    expect(EmailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        templateSlug: 'welcome',
        templateName: 'Welcome',
        recipient: 'user@example.com',
        status: 'failed',
        error: 'SMTP connection refused',
        metadata: { variables: { firstName: 'Ali' } }
      })
    );
  });

  // --- Requirement 5.4: Increment metadata.sendCount and update metadata.lastSentAt on success ---

  it('should increment template metadata.sendCount and update lastSentAt on success', async () => {
    const mockTemplate = {
      _id: 'tmpl456',
      slug: 'payment_confirmation',
      name: 'Payment Confirmation',
      subject: 'Payment received',
      htmlContent: '<p>Payment confirmed</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockResolvedValue({ messageId: '<msg-003@smtp.test>' });

    await emailService.sendTemplatedEmail(
      'payment_confirmation',
      'user@example.com',
      {}
    );

    expect(EmailTemplate.updateOne).toHaveBeenCalledWith(
      { _id: 'tmpl456' },
      expect.objectContaining({
        $inc: { 'metadata.sendCount': 1 },
        $set: { 'metadata.lastSentAt': expect.any(Date) }
      })
    );
  });

  it('should NOT increment metadata for default (hardcoded) templates', async () => {
    // No DB template found, falls back to hardcoded default
    EmailTemplate.findOne.mockResolvedValue(null);
    mockSendMail.mockResolvedValue({ messageId: '<msg-004@smtp.test>' });

    await emailService.sendTemplatedEmail(
      'welcome',
      'user@example.com',
      { firstName: 'Test' }
    );

    expect(EmailTemplate.updateOne).not.toHaveBeenCalled();
  });

  // --- Requirement 5.5: Return { success: false, error: 'Template not found' } if no template ---

  it('should return { success: false, error: "Template not found" } when no template exists', async () => {
    EmailTemplate.findOne.mockResolvedValue(null);

    const result = await emailService.sendTemplatedEmail(
      'nonexistent_template',
      'user@example.com',
      {}
    );

    expect(result).toEqual({ success: false, error: 'Template not found' });
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(EmailLog.create).not.toHaveBeenCalled();
  });

  // --- Requirement 4.4: Interpolation applied to both subject and htmlContent ---

  it('should interpolate variables in both subject and htmlContent', async () => {
    const mockTemplate = {
      _id: 'tmpl789',
      slug: 'booking_status_update',
      name: 'Booking Status Update',
      subject: 'Booking {{bookingReference}} - {{status}}',
      htmlContent: '<p>Hi {{userName}}, your booking {{bookingReference}} is now {{status}}.</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockResolvedValue({ messageId: '<msg-005@smtp.test>' });

    await emailService.sendTemplatedEmail(
      'booking_status_update',
      'user@example.com',
      { userName: 'John', bookingReference: 'TT-100', status: 'confirmed' }
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Booking TT-100 - confirmed',
        html: '<p>Hi John, your booking TT-100 is now confirmed.</p>'
      })
    );
  });

  // --- Edge case: Unmatched placeholders replaced with empty string ---

  it('should replace unmatched placeholders with empty string', async () => {
    const mockTemplate = {
      _id: 'tmpl999',
      slug: 'test_template',
      name: 'Test',
      subject: 'Hello {{name}} - {{missing}}',
      htmlContent: '<p>{{greeting}} {{name}}, ref: {{unknown}}</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockResolvedValue({ messageId: '<msg-006@smtp.test>' });

    await emailService.sendTemplatedEmail(
      'test_template',
      'user@example.com',
      { name: 'Alice', greeting: 'Hi' }
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Hello Alice - ',
        html: '<p>Hi Alice, ref: </p>'
      })
    );
  });

  // --- Options: recipientUserId and type are passed through ---

  it('should pass recipientUserId and type from options to EmailLog', async () => {
    const mockTemplate = {
      _id: 'tmpl123',
      slug: 'welcome',
      name: 'Welcome',
      subject: 'Welcome',
      htmlContent: '<p>Hello</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockResolvedValue({ messageId: '<msg-007@smtp.test>' });

    await emailService.sendTemplatedEmail(
      'welcome',
      'user@example.com',
      {},
      { recipientUserId: 'user-id-123', type: 'system' }
    );

    expect(EmailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUserId: 'user-id-123',
        type: 'system'
      })
    );
  });

  // --- SMTP failure should NOT increment template metadata ---

  it('should NOT increment template metadata on SMTP failure', async () => {
    const mockTemplate = {
      _id: 'tmpl123',
      slug: 'welcome',
      name: 'Welcome',
      subject: 'Welcome',
      htmlContent: '<p>Hello</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);
    mockSendMail.mockRejectedValue(new Error('Connection timeout'));

    await emailService.sendTemplatedEmail(
      'welcome',
      'user@example.com',
      {}
    );

    expect(EmailTemplate.updateOne).not.toHaveBeenCalled();
  });
});
