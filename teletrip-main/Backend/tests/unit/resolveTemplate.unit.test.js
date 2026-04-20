const EmailTemplate = require('../../models/emailTemplate.model');
const defaultTemplates = require('../../templates/email.templates');

// Mock the EmailTemplate model
jest.mock('../../models/emailTemplate.model');

// Mock nodemailer to avoid real SMTP connections during require
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  })
}));

const emailService = require('../../services/email.service');

describe('resolveTemplate()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Requirement 3.1: Query MongoDB for active, non-deleted template ---

  it('should return DB template with isDefault: false when found in database', async () => {
    const mockDbTemplate = {
      _id: 'abc123',
      slug: 'welcome',
      subject: 'Welcome!',
      htmlContent: '<p>Hello</p>',
      isActive: true,
      isDeleted: false
    };

    EmailTemplate.findOne.mockResolvedValue(mockDbTemplate);

    const result = await emailService.resolveTemplate('welcome');

    expect(EmailTemplate.findOne).toHaveBeenCalledWith({
      slug: 'welcome',
      isActive: true,
      isDeleted: false
    });
    expect(result).toEqual({ template: mockDbTemplate, isDefault: false });
  });

  // --- Requirement 3.2: Fall back to hardcoded default ---

  it('should return hardcoded default with isDefault: true when no DB template found', async () => {
    EmailTemplate.findOne.mockResolvedValue(null);

    const result = await emailService.resolveTemplate('welcome');

    expect(EmailTemplate.findOne).toHaveBeenCalledWith({
      slug: 'welcome',
      isActive: true,
      isDeleted: false
    });
    expect(result.isDefault).toBe(true);
    expect(result.template).toBe(defaultTemplates['welcome']);
  });

  // --- Requirement 3.3: Return null if neither exists ---

  it('should return { template: null, isDefault: false } when neither DB nor default exists', async () => {
    EmailTemplate.findOne.mockResolvedValue(null);

    const result = await emailService.resolveTemplate('nonexistent_slug');

    expect(result).toEqual({ template: null, isDefault: false });
  });

  // --- Requirement 3.4: Filter by isActive: true and isDeleted: false ---

  it('should query with isActive: true and isDeleted: false filters', async () => {
    EmailTemplate.findOne.mockResolvedValue(null);

    await emailService.resolveTemplate('booking_confirmation');

    expect(EmailTemplate.findOne).toHaveBeenCalledWith({
      slug: 'booking_confirmation',
      isActive: true,
      isDeleted: false
    });
  });

  // --- Requirement 3.5: DB template indicates isDefault: false ---

  it('should set isDefault to false for database-resolved templates', async () => {
    const mockDbTemplate = { slug: 'welcome', htmlContent: '<p>DB version</p>' };
    EmailTemplate.findOne.mockResolvedValue(mockDbTemplate);

    const result = await emailService.resolveTemplate('welcome');

    expect(result.isDefault).toBe(false);
  });

  // --- Requirement 3.6: Hardcoded default indicates isDefault: true ---

  it('should set isDefault to true for hardcoded default templates', async () => {
    EmailTemplate.findOne.mockResolvedValue(null);

    // 'welcome' exists in defaultTemplates
    const result = await emailService.resolveTemplate('welcome');

    expect(result.isDefault).toBe(true);
    expect(result.template).toBeDefined();
  });

  // --- Priority: DB template takes precedence over default ---

  it('should prefer DB template over hardcoded default when both exist', async () => {
    const mockDbTemplate = { slug: 'welcome', htmlContent: '<p>Custom DB version</p>' };
    EmailTemplate.findOne.mockResolvedValue(mockDbTemplate);

    const result = await emailService.resolveTemplate('welcome');

    expect(result.template).toBe(mockDbTemplate);
    expect(result.isDefault).toBe(false);
  });
});
