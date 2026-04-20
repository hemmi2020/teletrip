// Mock emailService.sendTemplatedEmail before requiring notification service
const mockSendTemplatedEmail = jest.fn().mockResolvedValue({ success: true, messageId: '<test-msg-id>' });

jest.mock('../../services/email.service', () => ({
  sendTemplatedEmail: mockSendTemplatedEmail
}));

// Mock nodemailer (used by NotificationService constructor)
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '<raw-msg-id>' })
  })
}));

// Mock the Notification model (used by in-app notification methods)
jest.mock('../../models/notification.model', () => {
  const mockSave = jest.fn().mockResolvedValue({});
  function MockNotification(data) {
    Object.assign(this, data);
    this.save = mockSave;
  }
  MockNotification.insertMany = jest.fn().mockResolvedValue([]);
  return MockNotification;
});

const notificationService = require('../../services/notification.service');

describe('NotificationService - New methods (Task 3.3)', () => {
  let originalAdminEmail;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendTemplatedEmail.mockResolvedValue({ success: true, messageId: '<test-msg-id>' });
    originalAdminEmail = process.env.ADMIN_EMAIL;
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalAdminEmail;
  });

  // --- Requirement 2.1: sendPaymentFailure delegates to sendTemplatedEmail('payment_failure', ...) ---
  describe('sendPaymentFailure()', () => {
    it('should call emailService.sendTemplatedEmail with slug "payment_failure" and forwarded variables', async () => {
      const variables = {
        userName: 'Ahmed',
        bookingReference: 'TT-2025-010',
        amount: '15000',
        paymentMethod: 'Credit Card',
        errorMessage: 'Insufficient funds',
        retryUrl: 'https://telitrip.com/retry/TT-2025-010'
      };

      await notificationService.sendPaymentFailure('ahmed@example.com', variables);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'payment_failure',
        'ahmed@example.com',
        variables
      );
    });
  });

  // --- sendCheckinReminder delegates to sendTemplatedEmail('checkin_reminder', ...) ---
  describe('sendCheckinReminder()', () => {
    it('should call emailService.sendTemplatedEmail with slug "checkin_reminder" and forwarded variables', async () => {
      const variables = {
        userName: 'Sara',
        bookingReference: 'TT-2025-011',
        hotelName: 'Pearl Continental',
        checkInDate: '2025-08-01',
        checkOutDate: '2025-08-05',
        hotelAddress: '123 Mall Road, Lahore',
        bookingUrl: 'https://telitrip.com/bookings/TT-2025-011'
      };

      await notificationService.sendCheckinReminder('sara@example.com', variables);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'checkin_reminder',
        'sara@example.com',
        variables
      );
    });
  });

  // --- sendFeedbackRequest delegates to sendTemplatedEmail('feedback_request', ...) ---
  describe('sendFeedbackRequest()', () => {
    it('should call emailService.sendTemplatedEmail with slug "feedback_request" and forwarded variables', async () => {
      const variables = {
        userName: 'Omar',
        bookingReference: 'TT-2025-012',
        hotelName: 'Serena Hotel',
        checkInDate: '2025-07-10',
        checkOutDate: '2025-07-14',
        reviewUrl: 'https://telitrip.com/review/TT-2025-012'
      };

      await notificationService.sendFeedbackRequest('omar@example.com', variables);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'feedback_request',
        'omar@example.com',
        variables
      );
    });
  });

  // --- Requirement 5.4: sendAdminNewBooking uses process.env.ADMIN_EMAIL ---
  describe('sendAdminNewBooking()', () => {
    it('should call emailService.sendTemplatedEmail with slug "admin_new_booking" and ADMIN_EMAIL', async () => {
      process.env.ADMIN_EMAIL = 'admin@telitrip.com';

      const booking = {
        bookingReference: 'TT-2025-020',
        customerName: 'Fatima Khan',
        customerEmail: 'fatima@example.com',
        hotelName: 'Marriott Islamabad',
        checkInDate: '2025-09-01',
        checkOutDate: '2025-09-04',
        totalAmount: 75000,
        bookingType: 'hotel'
      };

      await notificationService.sendAdminNewBooking(booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'admin_new_booking',
        'admin@telitrip.com',
        {
          bookingReference: 'TT-2025-020',
          customerName: 'Fatima Khan',
          customerEmail: 'fatima@example.com',
          hotelName: 'Marriott Islamabad',
          checkInDate: '2025-09-01',
          checkOutDate: '2025-09-04',
          totalAmount: '75000',
          bookingType: 'hotel'
        }
      );
    });

    it('should default bookingType to "hotel" when not provided', async () => {
      process.env.ADMIN_EMAIL = 'admin@telitrip.com';

      const booking = {
        bookingReference: 'TT-2025-021',
        customerName: 'Ali',
        customerEmail: 'ali@example.com',
        hotelName: 'Hilton',
        checkInDate: '2025-10-01',
        checkOutDate: '2025-10-03',
        totalAmount: 50000
      };

      await notificationService.sendAdminNewBooking(booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'admin_new_booking',
        'admin@telitrip.com',
        expect.objectContaining({ bookingType: 'hotel' })
      );
    });

    it('should return early with error when ADMIN_EMAIL is not set', async () => {
      delete process.env.ADMIN_EMAIL;

      const booking = {
        bookingReference: 'TT-2025-022',
        customerName: 'Test',
        customerEmail: 'test@example.com',
        hotelName: 'Test Hotel',
        checkInDate: '2025-10-01',
        checkOutDate: '2025-10-03',
        totalAmount: 10000
      };

      const result = await notificationService.sendAdminNewBooking(booking);

      expect(mockSendTemplatedEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: 'ADMIN_EMAIL not configured' });
    });
  });

  // --- Requirement 6.4: sendAdminBookingCancellation uses process.env.ADMIN_EMAIL ---
  describe('sendAdminBookingCancellation()', () => {
    it('should call emailService.sendTemplatedEmail with slug "admin_booking_cancellation" and ADMIN_EMAIL', async () => {
      process.env.ADMIN_EMAIL = 'admin@telitrip.com';

      const booking = {
        bookingReference: 'TT-2025-030',
        customerName: 'Zara Ahmed',
        customerEmail: 'zara@example.com',
        hotelName: 'Avari Towers',
        totalAmount: 60000,
        cancellationFee: 6000,
        refundAmount: 54000,
        cancellationReason: 'Change of plans'
      };

      await notificationService.sendAdminBookingCancellation(booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'admin_booking_cancellation',
        'admin@telitrip.com',
        {
          bookingReference: 'TT-2025-030',
          customerName: 'Zara Ahmed',
          customerEmail: 'zara@example.com',
          hotelName: 'Avari Towers',
          totalAmount: '60000',
          cancellationFee: '6000',
          refundAmount: '54000',
          cancellationReason: 'Change of plans'
        }
      );
    });

    it('should default cancellationFee, refundAmount, and cancellationReason when not provided', async () => {
      process.env.ADMIN_EMAIL = 'admin@telitrip.com';

      const booking = {
        bookingReference: 'TT-2025-031',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        hotelName: 'Test Hotel',
        totalAmount: 20000
      };

      await notificationService.sendAdminBookingCancellation(booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'admin_booking_cancellation',
        'admin@telitrip.com',
        expect.objectContaining({
          cancellationFee: '0',
          refundAmount: '0',
          cancellationReason: 'Customer requested'
        })
      );
    });

    it('should return early with error when ADMIN_EMAIL is not set', async () => {
      delete process.env.ADMIN_EMAIL;

      const booking = {
        bookingReference: 'TT-2025-032',
        customerName: 'Test',
        customerEmail: 'test@example.com',
        hotelName: 'Test Hotel',
        totalAmount: 10000
      };

      const result = await notificationService.sendAdminBookingCancellation(booking);

      expect(mockSendTemplatedEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: 'ADMIN_EMAIL not configured' });
    });
  });

  // --- sendPasswordResetEmail delegates to sendTemplatedEmail('password_reset', ...) ---
  describe('sendPasswordResetEmail()', () => {
    it('should call emailService.sendTemplatedEmail with slug "password_reset" and correct variables', async () => {
      await notificationService.sendPasswordResetEmail(
        'user@example.com',
        'Hassan',
        'https://telitrip.com/reset-password/abc123'
      );

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'password_reset',
        'user@example.com',
        {
          firstName: 'Hassan',
          resetLink: 'https://telitrip.com/reset-password/abc123',
          expiryTime: '10 minutes'
        }
      );
    });
  });

  // --- Requirement 7.4: sendPayOnSiteConfirmation uses sendTemplatedEmail with slug 'pay_on_site_confirmation' ---
  describe('sendPayOnSiteConfirmation()', () => {
    it('should call emailService.sendTemplatedEmail with slug "pay_on_site_confirmation" and mapped variables', async () => {
      const data = {
        user: { email: 'customer@example.com', fullname: 'Bilal Khan' },
        booking: {
          bookingReference: 'TT-2025-040',
          hotelName: 'Pearl Continental Lahore',
          checkInDate: '2025-08-15',
          checkOutDate: '2025-08-18'
        },
        payment: {
          amount: 45000,
          currency: 'PKR',
          paymentId: 'PAY-001'
        }
      };

      await notificationService.sendPayOnSiteConfirmation(data);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'pay_on_site_confirmation',
        'customer@example.com',
        {
          userName: 'Bilal Khan',
          bookingReference: 'TT-2025-040',
          hotelName: 'Pearl Continental Lahore',
          checkInDate: new Date('2025-08-15').toLocaleDateString(),
          checkOutDate: new Date('2025-08-18').toLocaleDateString(),
          totalAmount: '45000',
          currency: 'PKR',
          paymentId: 'PAY-001'
        }
      );
    });

    it('should default userName to "Customer" when fullname is not provided', async () => {
      const data = {
        user: { email: 'guest@example.com' },
        booking: {
          bookingReference: 'TT-2025-041',
          hotelName: 'Serena Hotel',
          checkInDate: '2025-09-01',
          checkOutDate: '2025-09-03'
        },
        payment: {
          amount: 30000,
          currency: 'PKR',
          paymentId: 'PAY-002'
        }
      };

      await notificationService.sendPayOnSiteConfirmation(data);

      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'pay_on_site_confirmation',
        'guest@example.com',
        expect.objectContaining({ userName: 'Customer' })
      );
    });

    it('should fall back to hotelBooking fields when top-level booking fields are missing', async () => {
      const data = {
        user: { email: 'guest@example.com', fullname: 'Test User' },
        booking: {
          bookingReference: 'TT-2025-042',
          hotelBooking: {
            hotelName: 'Fallback Hotel',
            checkIn: '2025-10-01',
            checkOut: '2025-10-05'
          }
        },
        payment: {
          amount: 20000,
          currency: 'USD',
          paymentId: 'PAY-003'
        }
      };

      await notificationService.sendPayOnSiteConfirmation(data);

      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'pay_on_site_confirmation',
        'guest@example.com',
        expect.objectContaining({
          hotelName: 'Fallback Hotel',
          checkInDate: new Date('2025-10-01').toLocaleDateString(),
          checkOutDate: new Date('2025-10-05').toLocaleDateString()
        })
      );
    });
  });
});
