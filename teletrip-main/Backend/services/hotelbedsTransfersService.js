const axios = require('axios');
const crypto = require('crypto');

class HotelbedsTransfersService {
  constructor() {
    this.apiKey = process.env.TRANSFERS_API_KEY;
    this.secret = process.env.TRANSFERS_SECRET;
    this.baseURL = 'https://api.test.hotelbeds.com/transfer-api/1.0';
    
    this.client = axios.create({ baseURL: this.baseURL });
    this.client.interceptors.request.use(config => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto.createHash('sha256').update(this.apiKey + this.secret + timestamp).digest('hex');
      config.headers['Api-key'] = this.apiKey;
      config.headers['X-Signature'] = signature;
      config.headers['Accept'] = 'application/json';
      return config;
    });
  }

  async searchTransfers(searchParams) {
    console.log('\n>>> HotelbedsTransfersService.searchTransfers called');
    console.log('Search Params:', JSON.stringify(searchParams, null, 2));
    
    try {
      const url = `/availability/${searchParams.language || 'en'}/from/${searchParams.fromType}/${searchParams.fromCode}/to/${searchParams.toType}/${searchParams.toCode}/${searchParams.outbound}/${searchParams.adults || 1}/${searchParams.children || 0}/${searchParams.infants || 0}`;
      
      console.log('Full API URL:', this.baseURL + url);
      console.log('Making GET request to Hotelbeds Transfers API...');
      
      const { data } = await this.client.get(url);
      
      console.log('API Response received successfully');
      console.log('Services found:', data.services?.length || 0);
      
      return {
        search: data.search,
        transfers: data.services?.map(service => ({
          id: service.id,
          rateKey: service.rateKey,
          direction: service.direction,
          transferType: service.transferType,
          vehicle: service.vehicle?.name,
          category: service.category?.name,
          pickupInformation: service.pickupInformation,
          price: {
            amount: service.price?.totalAmount,
            currency: service.price?.currencyId
          },
          minPaxCapacity: service.minPaxCapacity,
          maxPaxCapacity: service.maxPaxCapacity,
          content: service.content,
          cancellationPolicies: service.cancellationPolicies,
          images: service.content?.images?.map(img => img.url) || []
        })) || []
      };
    } catch (error) {
      console.log('API call failed!');
      throw this.handleError(error);
    }
  }

  /* getMockTransfers(searchParams) {
    const mockTransfers = [
      {
        id: 1,
        rateKey: `DEPARTURE|${searchParams.fromType}|${searchParams.fromCode}|${searchParams.toType}|${searchParams.toCode}|${searchParams.outbound}|${searchParams.adults}~${searchParams.children}~${searchParams.infants}|3|CR|STND|45.50||1|MOCK|SIMPLE|mock123|1001|T|abc123`,
        direction: 'DEPARTURE',
        transferType: 'PRIVATE',
        vehicle: 'Standard Car',
        category: 'Standard',
        pickupInformation: {
          from: { code: searchParams.fromCode, description: 'Pickup Location', type: searchParams.fromType },
          to: { code: searchParams.toCode, description: 'Dropoff Location', type: searchParams.toType },
          date: searchParams.outbound.split('T')[0],
          time: searchParams.outbound.split('T')[1]?.substring(0, 8) || '10:00:00'
        },
        price: { amount: 45.50, currency: 'EUR' },
        minPaxCapacity: 1,
        maxPaxCapacity: 3,
        content: {
          vehicle: { code: 'CR', name: 'Standard Car' },
          category: { code: 'STND', name: 'Standard' },
          images: [{ url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400' }],
          transferDetailInfo: [
            { id: '1', name: '20 min journey', description: '20 min estimated journey time', type: 'GENERAL_INFO' },
            { id: '2', name: '3 passengers max', description: '3 passengers maximum', type: 'GENERAL_INFO' },
            { id: '3', name: '3 suitcases', description: '3 suitcases permitted', type: 'GENERAL_INFO' }
          ],
          transferRemarks: [{ type: 'CONTRACT', description: 'Driver will meet you at arrival hall with name sign', mandatory: true }]
        },
        cancellationPolicies: [{ amount: 45.50, from: new Date(Date.now() + 86400000).toISOString(), currencyId: 'EUR' }],
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400']
      },
      {
        id: 2,
        rateKey: `DEPARTURE|${searchParams.fromType}|${searchParams.fromCode}|${searchParams.toType}|${searchParams.toCode}|${searchParams.outbound}|${searchParams.adults}~${searchParams.children}~${searchParams.infants}|7|VN|STND|65.00||2|MOCK|SIMPLE|mock456|1002|T|def456`,
        direction: 'DEPARTURE',
        transferType: 'PRIVATE',
        vehicle: 'Standard Van',
        category: 'Standard',
        pickupInformation: {
          from: { code: searchParams.fromCode, description: 'Pickup Location', type: searchParams.fromType },
          to: { code: searchParams.toCode, description: 'Dropoff Location', type: searchParams.toType },
          date: searchParams.outbound.split('T')[0],
          time: searchParams.outbound.split('T')[1]?.substring(0, 8) || '10:00:00'
        },
        price: { amount: 65.00, currency: 'EUR' },
        minPaxCapacity: 1,
        maxPaxCapacity: 7,
        content: {
          vehicle: { code: 'VN', name: 'Standard Van' },
          category: { code: 'STND', name: 'Standard' },
          images: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400' }],
          transferDetailInfo: [
            { id: '1', name: '20 min journey', description: '20 min estimated journey time', type: 'GENERAL_INFO' },
            { id: '2', name: '7 passengers max', description: '7 passengers maximum', type: 'GENERAL_INFO' },
            { id: '3', name: '7 suitcases', description: '7 suitcases permitted', type: 'GENERAL_INFO' }
          ],
          transferRemarks: [{ type: 'CONTRACT', description: 'Driver will meet you at arrival hall with name sign', mandatory: true }]
        },
        cancellationPolicies: [{ amount: 65.00, from: new Date(Date.now() + 86400000).toISOString(), currencyId: 'EUR' }],
        images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400']
      },
      {
        id: 3,
        rateKey: `DEPARTURE|${searchParams.fromType}|${searchParams.fromCode}|${searchParams.toType}|${searchParams.toCode}|${searchParams.outbound}|${searchParams.adults}~${searchParams.children}~${searchParams.infants}|3|CR|EXEC|85.00||3|MOCK|SIMPLE|mock789|1003|T|ghi789`,
        direction: 'DEPARTURE',
        transferType: 'PRIVATE',
        vehicle: 'Executive Car',
        category: 'Executive',
        pickupInformation: {
          from: { code: searchParams.fromCode, description: 'Pickup Location', type: searchParams.fromType },
          to: { code: searchParams.toCode, description: 'Dropoff Location', type: searchParams.toType },
          date: searchParams.outbound.split('T')[0],
          time: searchParams.outbound.split('T')[1]?.substring(0, 8) || '10:00:00'
        },
        price: { amount: 85.00, currency: 'EUR' },
        minPaxCapacity: 1,
        maxPaxCapacity: 3,
        content: {
          vehicle: { code: 'CR', name: 'Executive Car' },
          category: { code: 'EXEC', name: 'Executive' },
          images: [{ url: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400' }],
          transferDetailInfo: [
            { id: '1', name: '20 min journey', description: '20 min estimated journey time', type: 'GENERAL_INFO' },
            { id: '2', name: '3 passengers max', description: '3 passengers maximum', type: 'GENERAL_INFO' },
            { id: '3', name: 'Premium service', description: 'Luxury vehicle with professional driver', type: 'GENERAL_INFO' }
          ],
          transferRemarks: [{ type: 'CONTRACT', description: 'Premium driver will meet you with name sign at VIP area', mandatory: true }]
        },
        cancellationPolicies: [{ amount: 85.00, from: new Date(Date.now() + 86400000).toISOString(), currencyId: 'EUR' }],
        images: ['https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400']
      }
    ];

    return {
      search: {
        language: searchParams.language || 'en',
        from: { code: searchParams.fromCode, type: searchParams.fromType },
        to: { code: searchParams.toCode, type: searchParams.toType },
        departure: { date: searchParams.outbound.split('T')[0], time: searchParams.outbound.split('T')[1]?.substring(0, 8) || '10:00:00' },
        occupancy: { adults: searchParams.adults || 1, children: searchParams.children || 0, infants: searchParams.infants || 0 }
      },
      transfers: mockTransfers
    };
  } */

  async getTransferDetails(transferCode, searchId, language = 'en') {
    return {
      code: transferCode,
      vehicle: { code: 'CR', name: 'Standard Car' },
      services: ['Door-to-door service', 'Meet & Greet', 'Flight monitoring'],
      cancellationPolicies: [{ amount: 45.50, from: new Date(Date.now() + 86400000).toISOString() }],
      terms: 'Standard terms and conditions apply',
      pickupInstructions: 'Driver will meet you at arrival hall',
      contact: { name: 'Transfer Service', phone: '+34 123 456 789' }
    };
  }

  async checkAvailability(availabilityParams) {
    return {
      available: true,
      price: { amount: 45.50, currency: 'EUR' },
      vehicle: { code: 'CR', name: 'Standard Car' },
      services: ['Door-to-door service']
    };
  }

  async createBooking(bookingData) {
    const Booking = require('../models/booking.model');
    const bookingReference = `MOCK-${Date.now()}`;
    
    const booking = await Booking.create({
      bookingReference,
      user: bookingData.userId,
      bookingType: 'transfer',
      status: 'confirmed',
      transferBooking: {
        rateKey: bookingData.transfers[0].rateKey,
        holder: bookingData.holder,
        transfers: bookingData.transfers.map(t => ({
          vehicle: t.vehicle || 'Standard Car',
          category: t.category || 'Standard',
          pickupDate: new Date(t.transferDetails?.[0]?.date || Date.now()),
          pickupTime: t.transferDetails?.[0]?.time || '10:00',
          pickupLocation: t.pickupLocation || 'Pickup Location',
          dropoffLocation: t.dropoffLocation || 'Dropoff Location',
          passengers: t.passengers || []
        })),
        voucher: `VOUCHER-${Date.now()}`,
        clientReference: bookingData.clientReference || `REF-${Date.now()}`,
        confirmationNumber: bookingReference
      },
      pricing: {
        basePrice: 45.50,
        totalAmount: 45.50,
        currency: 'EUR'
      },
      payment: {
        status: 'completed'
      }
    });
    
    return {
      bookingReference,
      bookingId: booking.bookingId,
      status: 'CONFIRMED',
      voucher: `VOUCHER-${Date.now()}`,
      holder: bookingData.holder,
      transfers: bookingData.transfers,
      totalAmount: 45.50,
      currency: 'EUR'
    };
  }

  async getBookingDetails(bookingReference) {
    const Booking = require('../models/booking.model');
    const booking = await Booking.findOne({ bookingReference });
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async cancelBooking(bookingReference, userId, reason) {
    const Booking = require('../models/booking.model');
    const booking = await Booking.findOne({ bookingReference, user: userId });
    
    if (!booking) throw new Error('Booking not found');
    if (!booking.canCancel) throw new Error('Booking cannot be cancelled');
    
    await booking.cancelBooking(reason, userId);
    
    return {
      cancelled: true,
      refundAmount: booking.cancellation.refundAmount,
      cancellationFee: booking.cancellation.cancellationFee
    };
  }

  async getUserBookings(userId, filters = {}) {
    const Booking = require('../models/booking.model');
    const query = { user: userId, bookingType: 'transfer' };
    
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Booking.countDocuments(query);
    
    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  handleError(error) {
    console.error('Hotelbeds API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response) {
      return new Error(error.response.data?.message || error.response.data?.error?.message || error.response.statusText);
    }
    return error;
  }
}

module.exports = new HotelbedsTransfersService();
