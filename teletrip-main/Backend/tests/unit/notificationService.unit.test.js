const fs = require('fs');
const path = require('path');

// Mock emailService.sendTemplatedEmail before requiring notification service
const mockSendTemplatedEmail = jest.fn().mockResolvedValue({ success: true, messageId: '<test-msg-id>' });

jest.mock('../../services/email.service', () => ({
  sendTemplatedEmail: mockSendTemplatedEmail
}));

// Mock nodemailer (used by NotificationService constructor and sendEmail)
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
  MockNotification._mockSave = mockSave;
  return MockNotification;
});

const notificationService = require('../../services/notification.service');

describe('NotificationService - Email methods refactored to use sendTemplatedEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendTemplatedEmail.mockResolvedValue({ success: true, messageId: '<test-msg-id>' });
  });

  // --- Requirement 12.3: sendWelcomeEmail delegates to sendTemplatedEmail('welcome', ...) ---
  describe('sendWelcomeEmail()', () => {
    it('should call emailService.sendTemplatedEmail with slug "welcome" and { firstName }', async () => {
      await notificationService.sendWelcomeEmail('user@example.com', 'Ahmed');

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'welcome',
        'user@example.com',
        { firstName: 'Ahmed' }
      );
    });
  });

  // --- Requirement 12.1: sendBookingConfirmation delegates to sendTemplatedEmail('booking_confirmation', ...) ---
  describe('sendBookingConfirmation()', () => {
    it('should call emailService.sendTemplatedEmail with slug "booking_confirmation" and booking variables', async () => {
      const booking = {
        userId: { firstName: 'Sara' },
        bookingReference: 'TT-2025-001',
        hotelId: { name: 'Pearl Continental' },
        checkInDate: '2025-07-15',
        checkOutDate: '2025-07-18',
        totalAmount: 45000,
        guests: 2,
        rooms: 1
      };

      await notificationService.sendBookingConfirmation('sara@example.com', booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'booking_confirmation',
        'sara@example.com',
        {
          userName: 'Sara',
          bookingReference: 'TT-2025-001',
          hotelName: 'Pearl Continental',
          checkInDate: new Date('2025-07-15').toLocaleDateString(),
          checkOutDate: new Date('2025-07-18').toLocaleDateString(),
          totalAmount: '45000',
          guests: '2',
          rooms: '1'
        }
      );
    });
  });

  // --- Requirement 12.2: sendBookingCancellation delegates to sendTemplatedEmail('booking_cancellation', ...) ---
  describe('sendBookingCancellation()', () => {
    it('should call emailService.sendTemplatedEmail with slug "booking_cancellation" and cancellation variables', async () => {
      const booking = {
        userId: { firstName: 'Ali' },
        bookingReference: 'TT-2025-002',
        hotelId: { name: 'Serena Hotel' },
        totalAmount: 30000,
        cancellation: { fee: 3000, refundAmount: 27000 }
      };

      await notificationService.sendBookingCancellation('ali@example.com', booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'booking_cancellation',
        'ali@example.com',
        {
          userName: 'Ali',
          bookingReference: 'TT-2025-002',
          hotelName: 'Serena Hotel',
          totalAmount: '30000',
          cancellationFee: '3000',
          refundAmount: '27000'
        }
      );
    });
  });

  // --- Requirement 12.4: sendPasswordChangeNotification delegates to sendTemplatedEmail('password_changed', ...) ---
  describe('sendPasswordChangeNotification()', () => {
    it('should call emailService.sendTemplatedEmail with slug "password_changed" and { firstName }', async () => {
      await notificationService.sendPasswordChangeNotification('user@example.com', 'Fatima');

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'password_changed',
        'user@example.com',
        { firstName: 'Fatima' }
      );
    });
  });

  // --- Requirement 12.7: sendBookingStatusUpdate delegates to sendTemplatedEmail('booking_status_update', ...) ---
  describe('sendBookingStatusUpdate()', () => {
    it('should call emailService.sendTemplatedEmail with slug "booking_status_update" and status variables', async () => {
      const booking = {
        userId: { firstName: 'John' },
        bookingReference: 'TT-2025-003',
        hotelId: { name: 'Marriott' },
        status: 'confirmed',
        adminNotes: 'Approved by manager'
      };

      await notificationService.sendBookingStatusUpdate('john@example.com', booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'booking_status_update',
        'john@example.com',
        {
          userName: 'John',
          bookingReference: 'TT-2025-003',
          hotelName: 'Marriott',
          status: 'confirmed',
          adminNotes: 'Approved by manager'
        }
      );
    });

    it('should pass empty string for adminNotes when not provided', async () => {
      const booking = {
        userId: { firstName: 'Jane' },
        bookingReference: 'TT-2025-004',
        hotelId: { name: 'Hilton' },
        status: 'cancelled'
      };

      await notificationService.sendBookingStatusUpdate('jane@example.com', booking);

      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'booking_status_update',
        'jane@example.com',
        expect.objectContaining({ adminNotes: '' })
      );
    });
  });

  // --- Requirement 12.5: sendAccountSuspensionNotification delegates to sendTemplatedEmail('account_suspended', ...) ---
  describe('sendAccountSuspensionNotification()', () => {
    it('should call emailService.sendTemplatedEmail with slug "account_suspended" and { reason }', async () => {
      await notificationService.sendAccountSuspensionNotification('user@example.com', 'Terms violation');

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'account_suspended',
        'user@example.com',
        { reason: 'Terms violation' }
      );
    });
  });

  // --- Requirement 12.6: sendAccountReactivationNotification delegates to sendTemplatedEmail('account_reactivated', ...) ---
  describe('sendAccountReactivationNotification()', () => {
    it('should call emailService.sendTemplatedEmail with slug "account_reactivated" and empty variables', async () => {
      await notificationService.sendAccountReactivationNotification('user@example.com');

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'account_reactivated',
        'user@example.com',
        {}
      );
    });
  });

  // --- sendSupportTicketNotification delegates to sendTemplatedEmail('support_ticket_created', ...) ---
  describe('sendSupportTicketNotification()', () => {
    it('should call emailService.sendTemplatedEmail with slug "support_ticket_created" and ticket variables', async () => {
      const originalAdminEmail = process.env.ADMIN_EMAIL;
      process.env.ADMIN_EMAIL = 'admin@telitrip.com';

      const ticket = {
        ticketNumber: 'TK-001',
        userId: { firstName: 'Omar', lastName: 'Khan', email: 'omar@example.com' },
        subject: 'Booking issue',
        category: 'booking',
        priority: 'high',
        description: 'Cannot view my booking details'
      };

      await notificationService.sendSupportTicketNotification(ticket);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'support_ticket_created',
        'admin@telitrip.com',
        {
          ticketNumber: 'TK-001',
          userName: 'Omar Khan',
          userEmail: 'omar@example.com',
          subject: 'Booking issue',
          category: 'booking',
          priority: 'high',
          description: 'Cannot view my booking details'
        }
      );

      process.env.ADMIN_EMAIL = originalAdminEmail;
    });
  });

  // --- sendTicketResponseNotification delegates to sendTemplatedEmail('support_ticket_response', ...) ---
  describe('sendTicketResponseNotification()', () => {
    it('should call emailService.sendTemplatedEmail with slug "support_ticket_response" and user variables', async () => {
      const ticket = {
        ticketNumber: 'TK-002',
        subject: 'Payment refund',
        userId: { firstName: 'Zara', email: 'zara@example.com' }
      };

      await notificationService.sendTicketResponseNotification(ticket);

      expect(mockSendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendTemplatedEmail).toHaveBeenCalledWith(
        'support_ticket_response',
        'zara@example.com',
        {
          firstName: 'Zara',
          ticketNumber: 'TK-002',
          subject: 'Payment refund'
        }
      );
    });
  });

  // --- Requirement 12.8: No inline HTML remains in notification service email methods ---
  describe('No inline HTML in email methods', () => {
    it('should not contain inline HTML template strings in the notification service source', () => {
      const sourcePath = path.join(__dirname, '../../services/notification.service.js');
      const source = fs.readFileSync(sourcePath, 'utf-8');

      // Extract only the class method bodies for the 9 refactored email methods
      const emailMethodNames = [
        'sendWelcomeEmail',
        'sendBookingConfirmation',
        'sendBookingCancellation',
        'sendPasswordChangeNotification',
        'sendBookingStatusUpdate',
        'sendAccountSuspensionNotification',
        'sendAccountReactivationNotification',
        'sendSupportTicketNotification',
        'sendTicketResponseNotification'
      ];

      for (const methodName of emailMethodNames) {
        // Find the method and check it doesn't contain HTML tags typical of inline templates
        const methodRegex = new RegExp(`async ${methodName}\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm');
        const match = source.match(methodRegex);

        if (match) {
          const methodBody = match[1];
          // Should not contain DOCTYPE, <html>, <head>, <style>, or large HTML blocks
          expect(methodBody).not.toMatch(/<!DOCTYPE/i);
          expect(methodBody).not.toMatch(/<html/i);
          expect(methodBody).not.toMatch(/<head/i);
          expect(methodBody).not.toMatch(/<style/i);
          expect(methodBody).not.toMatch(/<div class="container"/i);
          // Should contain sendTemplatedEmail call
          expect(methodBody).toMatch(/emailService\.sendTemplatedEmail/);
        }
      }
    });
  });
});
