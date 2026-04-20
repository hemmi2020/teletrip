/**
 * Unit tests for migrated email service methods (Task 4.2)
 *
 * Verifies that sendWelcomeEmail, sendPasswordResetEmail, and sendBookingConfirmation
 * delegate to sendTemplatedEmail with the correct slug and variable mappings.
 *
 * Validates: Requirements 8.1, 8.2, 8.3
 */

// Mock nodemailer before requiring email service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '<test-msg-id>' })
  })
}));

// Mock Mongoose models used by email service
jest.mock('../../models/emailTemplate.model', () => ({
  findOne: jest.fn(),
  updateOne: jest.fn()
}));
jest.mock('../../models/emailLog.model', () => ({
  create: jest.fn().mockResolvedValue({}),
  insertMany: jest.fn().mockResolvedValue([])
}));
jest.mock('../../models/user.model', () => ({
  find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) })
}));

const emailService = require('../../services/email.service');

describe('EmailService - Migrated methods (Task 4.2)', () => {
  let sendTemplatedEmailSpy;

  beforeEach(() => {
    // Spy on sendTemplatedEmail and mock its return value
    sendTemplatedEmailSpy = jest.spyOn(emailService, 'sendTemplatedEmail')
      .mockResolvedValue({ success: true, messageId: '<templated-msg-id>' });
  });

  afterEach(() => {
    sendTemplatedEmailSpy.mockRestore();
  });

  // --- Requirement 8.1: sendWelcomeEmail delegates to sendTemplatedEmail('welcome', ...) ---
  describe('sendWelcomeEmail()', () => {
    it('should call sendTemplatedEmail with slug "welcome" and correct variables', async () => {
      const user = {
        email: 'newuser@example.com',
        fullname: { firstname: 'Ahmed', lastname: 'Khan' }
      };

      const result = await emailService.sendWelcomeEmail(user);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'welcome',
        'newuser@example.com',
        {
          firstName: 'Ahmed',
          exploreUrl: expect.stringContaining('/destinations')
        }
      );
      expect(result).toEqual({ success: true, messageId: '<templated-msg-id>' });
    });

    it('should default firstName to "Traveler" when fullname is missing', async () => {
      const user = { email: 'guest@example.com' };

      await emailService.sendWelcomeEmail(user);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'welcome',
        'guest@example.com',
        expect.objectContaining({ firstName: 'Traveler' })
      );
    });

    it('should default firstName to "Traveler" when firstname is missing', async () => {
      const user = { email: 'guest@example.com', fullname: { lastname: 'Smith' } };

      await emailService.sendWelcomeEmail(user);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'welcome',
        'guest@example.com',
        expect.objectContaining({ firstName: 'Traveler' })
      );
    });

    it('should include FRONTEND_URL in exploreUrl when env var is set', async () => {
      const originalUrl = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'https://mysite.com';

      const user = { email: 'test@example.com', fullname: { firstname: 'Test' } };
      await emailService.sendWelcomeEmail(user);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'welcome',
        'test@example.com',
        expect.objectContaining({ exploreUrl: 'https://mysite.com/destinations' })
      );

      process.env.FRONTEND_URL = originalUrl;
    });
  });

  // --- Requirement 8.2: sendPasswordResetEmail delegates to sendTemplatedEmail('password_reset', ...) ---
  describe('sendPasswordResetEmail()', () => {
    it('should call sendTemplatedEmail with slug "password_reset" and correct variables', async () => {
      const user = {
        email: 'user@example.com',
        fullname: { firstname: 'Sara', lastname: 'Ali' }
      };
      const resetToken = 'abc123def456';

      const result = await emailService.sendPasswordResetEmail(user, resetToken);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'password_reset',
        'user@example.com',
        {
          firstName: 'Sara',
          resetLink: expect.stringContaining(`/reset-password/${resetToken}`),
          expiryTime: '10 minutes'
        }
      );
      expect(result).toEqual({ success: true, messageId: '<templated-msg-id>' });
    });

    it('should default firstName to "User" when fullname is missing', async () => {
      const user = { email: 'nofullname@example.com' };

      await emailService.sendPasswordResetEmail(user, 'token123');

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'password_reset',
        'nofullname@example.com',
        expect.objectContaining({ firstName: 'User' })
      );
    });

    it('should construct resetLink using FRONTEND_URL env var', async () => {
      const originalUrl = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'https://telitrip.com';

      const user = { email: 'test@example.com', fullname: { firstname: 'Test' } };
      await emailService.sendPasswordResetEmail(user, 'mytoken');

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'password_reset',
        'test@example.com',
        expect.objectContaining({
          resetLink: 'https://telitrip.com/reset-password/mytoken'
        })
      );

      process.env.FRONTEND_URL = originalUrl;
    });
  });

  // --- Requirement 8.3: sendBookingConfirmation delegates to sendTemplatedEmail('booking_confirmation', ...) ---
  describe('sendBookingConfirmation()', () => {
    it('should call sendTemplatedEmail with slug "booking_confirmation" and correct variables', async () => {
      const user = {
        email: 'booker@example.com',
        fullname: { firstname: 'Omar', lastname: 'Hassan' }
      };
      const booking = {
        bookingId: 'TT-2025-100',
        hotelName: 'Marriott Islamabad',
        checkIn: new Date('2025-09-01'),
        checkOut: new Date('2025-09-05'),
        totalAmount: 120000,
        guests: 2,
        rooms: 1
      };

      const result = await emailService.sendBookingConfirmation(user, booking);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'booking_confirmation',
        'booker@example.com',
        {
          userName: 'Omar',
          bookingReference: 'TT-2025-100',
          hotelName: 'Marriott Islamabad',
          checkInDate: new Date('2025-09-01').toDateString(),
          checkOutDate: new Date('2025-09-05').toDateString(),
          totalAmount: '€120000.00',
          guests: '2',
          rooms: '1'
        }
      );
      expect(result).toEqual({ success: true, messageId: '<templated-msg-id>' });
    });

    it('should default userName to "Customer" when fullname is missing', async () => {
      const user = { email: 'guest@example.com' };
      const booking = {
        bookingId: 'TT-2025-101',
        hotelName: 'Test Hotel',
        checkIn: '2025-10-01',
        checkOut: '2025-10-03',
        totalAmount: 50000,
        guests: 1,
        rooms: 1
      };

      await emailService.sendBookingConfirmation(user, booking);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'booking_confirmation',
        'guest@example.com',
        expect.objectContaining({ userName: 'Customer' })
      );
    });

    it('should default guests to "1" and rooms to "1" when not provided', async () => {
      const user = { email: 'test@example.com', fullname: { firstname: 'Test' } };
      const booking = {
        bookingId: 'TT-2025-102',
        hotelName: 'Hotel ABC',
        checkIn: '2025-11-01',
        checkOut: '2025-11-03',
        totalAmount: 30000
      };

      await emailService.sendBookingConfirmation(user, booking);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'booking_confirmation',
        'test@example.com',
        expect.objectContaining({
          guests: '1',
          rooms: '1'
        })
      );
    });

    it('should handle string checkIn/checkOut dates when toDateString is not available', async () => {
      const user = { email: 'test@example.com', fullname: { firstname: 'Test' } };
      const booking = {
        bookingId: 'TT-2025-103',
        hotelName: 'Hotel XYZ',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        totalAmount: 40000,
        guests: 3,
        rooms: 2
      };

      await emailService.sendBookingConfirmation(user, booking);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'booking_confirmation',
        'test@example.com',
        expect.objectContaining({
          checkInDate: '2025-12-01',
          checkOutDate: '2025-12-05'
        })
      );
    });

    it('should format totalAmount with euro sign and two decimals when toFixed is available', async () => {
      const user = { email: 'test@example.com', fullname: { firstname: 'Test' } };
      const booking = {
        bookingId: 'TT-2025-104',
        hotelName: 'Hotel Test',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        totalAmount: 99.5,
        guests: 1,
        rooms: 1
      };

      await emailService.sendBookingConfirmation(user, booking);

      expect(sendTemplatedEmailSpy).toHaveBeenCalledWith(
        'booking_confirmation',
        'test@example.com',
        expect.objectContaining({
          totalAmount: '€99.50'
        })
      );
    });
  });
});
