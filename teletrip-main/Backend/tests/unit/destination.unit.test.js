const { generateSlug } = require('../../utils/slug.util');

// --- Mock Destination model ---
jest.mock('../../models/destination.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  bulkWrite: jest.fn(),
}));
const Destination = require('../../models/destination.model');

// --- Mock logger to suppress output during tests ---
jest.mock('../../utils/logger.util', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  performance: jest.fn(),
}));

const {
  getDestinations,
  getDestinationBySlug,
  adminGetDestinations,
  createDestination,
  updateDestination,
  reorderDestinations,
} = require('../../controllers/destinations.controller');

// Helper to create mock req/res/next
function mockReqRes(overrides = {}) {
  const req = {
    params: {},
    body: {},
    query: {},
    headers: {},
    ...overrides,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

// Helper to extract response from mock res
function getResponse(res) {
  const statusCode = res.status.mock.calls[0]?.[0];
  const body = res.json.mock.calls[0]?.[0];
  return { statusCode, body };
}

// Helper: invoke a controller wrapped by asyncErrorHandler and wait for completion.
// asyncErrorHandler does NOT return the inner promise, so we intercept res.json or next
// to know when the handler has finished.
function callController(handler, req, res, next) {
  return new Promise((resolve) => {
    // Intercept json to detect when response is sent
    const origJson = res.json;
    res.json = jest.fn(function (...args) {
      origJson.apply(this, args);
      resolve();
      return this;
    });
    res.json.mockReturnThis = origJson.mockReturnThis;

    // Intercept next to detect error path
    const origNext = next;
    const wrappedNext = jest.fn((...args) => {
      origNext(...args);
      resolve();
    });

    handler(req, res, wrappedNext);
  });
}

// ============================================================
// Controller endpoint unit tests
// ============================================================

describe('Destination Controller Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Requirement 1.3: Slug uniqueness enforcement (409) ---
  describe('createDestination', () => {
    it('should return 409 when slug already exists', async () => {
      Destination.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'existing-id', slug: 'paris-france' }) });

      const { req, res, next } = mockReqRes({
        body: { name: 'Paris', country: 'France', image: 'img.jpg' },
      });

      await callController(createDestination, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(409);
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/slug already exists/i);
    });

    it('should auto-generate slug from name and country on create', async () => {
      Destination.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const createdDoc = {
        _id: 'new-id',
        name: 'São Paulo',
        country: 'Brazil',
        slug: 'sao-paulo-brazil',
        image: 'img.jpg',
      };
      Destination.create.mockResolvedValue(createdDoc);

      const { req, res, next } = mockReqRes({
        body: { name: 'São Paulo', country: 'Brazil', image: 'img.jpg' },
      });

      await callController(createDestination, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(201);
      expect(body.success).toBe(true);
      // Verify slug was passed to create
      expect(Destination.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'sao-paulo-brazil' })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const { req, res, next } = mockReqRes({
        body: { name: 'Paris' }, // missing country and image
      });

      await callController(createDestination, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  // --- Requirement 1.5: 404 for non-existent slug ---
  describe('getDestinationBySlug', () => {
    it('should return 404 for non-existent slug', async () => {
      Destination.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const { req, res, next } = mockReqRes({
        params: { slug: 'nonexistent-slug' },
      });

      await callController(getDestinationBySlug, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(404);
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/not found/i);
    });

    it('should return 200 with destination data for existing slug', async () => {
      const destination = {
        _id: 'abc123',
        name: 'Paris',
        country: 'France',
        slug: 'paris-france',
        image: 'img.jpg',
      };
      Destination.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(destination) });

      const { req, res, next } = mockReqRes({
        params: { slug: 'paris-france' },
      });

      await callController(getDestinationBySlug, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('paris-france');
    });
  });

  // --- Requirement 1.4: Update preserves slug unless name/country changed ---
  describe('updateDestination', () => {
    it('should preserve slug when name and country are unchanged', async () => {
      const existing = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Paris',
        country: 'France',
        slug: 'paris-france',
        image: 'img.jpg',
      };
      Destination.findById.mockResolvedValue(existing);
      Destination.findByIdAndUpdate.mockResolvedValue({ ...existing, description: 'Updated desc' });

      const { req, res, next } = mockReqRes({
        params: { id: '507f1f77bcf86cd799439011' },
        body: { description: 'Updated desc' },
      });

      await callController(updateDestination, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(200);
      expect(body.success).toBe(true);
      // Slug should NOT be in the update data since name/country didn't change
      const updateCall = Destination.findByIdAndUpdate.mock.calls[0];
      expect(updateCall[1].slug).toBeUndefined();
    });

    it('should regenerate slug when name changes', async () => {
      const existing = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Paris',
        country: 'France',
        slug: 'paris-france',
        image: 'img.jpg',
      };
      Destination.findById.mockResolvedValue(existing);
      Destination.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      Destination.findByIdAndUpdate.mockResolvedValue({
        ...existing,
        name: 'Lyon',
        slug: 'lyon-france',
      });

      const { req, res, next } = mockReqRes({
        params: { id: '507f1f77bcf86cd799439011' },
        body: { name: 'Lyon' },
      });

      await callController(updateDestination, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(200);
      const updateCall = Destination.findByIdAndUpdate.mock.calls[0];
      expect(updateCall[1].slug).toBe('lyon-france');
    });

    it('should return 409 when updated slug conflicts with another destination', async () => {
      const existing = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Paris',
        country: 'France',
        slug: 'paris-france',
      };
      Destination.findById.mockResolvedValue(existing);
      Destination.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'other-id', slug: 'lyon-france' }),
      });

      const { req, res, next } = mockReqRes({
        params: { id: '507f1f77bcf86cd799439011' },
        body: { name: 'Lyon' },
      });

      await callController(updateDestination, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(409);
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/slug already exists/i);
    });
  });

  // --- Requirement 1.5: Reorder endpoint ---
  describe('reorderDestinations', () => {
    it('should update multiple order values via bulkWrite', async () => {
      Destination.bulkWrite.mockResolvedValue({ modifiedCount: 3 });

      const orders = [
        { id: 'id1', order: 0 },
        { id: 'id2', order: 1 },
        { id: 'id3', order: 2 },
      ];

      const { req, res, next } = mockReqRes({
        body: { orders },
      });

      await callController(reorderDestinations, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(Destination.bulkWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: { _id: 'id1' },
              update: { $set: { order: 0 } },
            }),
          }),
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: { _id: 'id2' },
              update: { $set: { order: 1 } },
            }),
          }),
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: { _id: 'id3' },
              update: { $set: { order: 2 } },
            }),
          }),
        ])
      );
    });

    it('should return 400 when orders array is empty', async () => {
      const { req, res, next } = mockReqRes({
        body: { orders: [] },
      });

      await callController(reorderDestinations, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should return 400 when orders is not an array', async () => {
      const { req, res, next } = mockReqRes({
        body: { orders: 'not-an-array' },
      });

      await callController(reorderDestinations, req, res, next);

      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  // --- Requirement 1.3: Admin GET returns inactive, public GET does not ---
  describe('getDestinations (public) vs adminGetDestinations', () => {
    it('public getDestinations should query only active destinations', async () => {
      const activeDestinations = [
        { _id: '1', name: 'Paris', isActive: true },
        { _id: '2', name: 'London', isActive: true },
      ];
      Destination.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(activeDestinations),
        }),
      });

      const { req, res, next } = mockReqRes();

      await callController(getDestinations, req, res, next);

      // Verify find was called with isActive: true filter
      expect(Destination.find).toHaveBeenCalledWith({ isActive: true });
      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(200);
      expect(body.data).toHaveLength(2);
    });

    it('adminGetDestinations should query all destinations (including inactive)', async () => {
      const allDestinations = [
        { _id: '1', name: 'Paris', isActive: true },
        { _id: '2', name: 'London', isActive: false },
        { _id: '3', name: 'Tokyo', isActive: true },
      ];
      Destination.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(allDestinations),
        }),
      });

      const { req, res, next } = mockReqRes();

      await callController(adminGetDestinations, req, res, next);

      // Verify find was called without isActive filter
      expect(Destination.find).toHaveBeenCalledWith();
      const { statusCode, body } = getResponse(res);
      expect(statusCode).toBe(200);
      expect(body.data).toHaveLength(3);
    });
  });
});

describe('generateSlug()', () => {
  // --- Requirement 1.2: Auto-generate URL-safe slug from name and country ---

  it('should generate a slug from name and country', () => {
    expect(generateSlug('Paris', 'France')).toBe('paris-france');
  });

  it('should convert to lowercase', () => {
    expect(generateSlug('NEW YORK', 'USA')).toBe('new-york-usa');
  });

  // --- Accented characters ---

  it('should replace accented characters with ASCII equivalents (São Paulo)', () => {
    expect(generateSlug('São Paulo', 'Brazil')).toBe('sao-paulo-brazil');
  });

  it('should handle umlauts (München)', () => {
    expect(generateSlug('München', 'Germany')).toBe('munchen-germany');
  });

  it('should handle cedilla (Curaçao)', () => {
    expect(generateSlug('Curaçao', 'Caribbean')).toBe('curacao-caribbean');
  });

  it('should handle tilde (Señor)', () => {
    expect(generateSlug('Año Nuevo', 'Chile')).toBe('ano-nuevo-chile');
  });

  // --- Special characters ---

  it('should replace special characters with hyphens', () => {
    expect(generateSlug('St. John\'s', 'Canada')).toBe('st-john-s-canada');
  });

  it('should handle ampersands', () => {
    expect(generateSlug('Trinidad & Tobago', 'Caribbean')).toBe('trinidad-tobago-caribbean');
  });

  it('should handle parentheses', () => {
    expect(generateSlug('Washington (DC)', 'USA')).toBe('washington-dc-usa');
  });

  it('should collapse consecutive hyphens into a single hyphen', () => {
    expect(generateSlug('New---York', 'USA')).toBe('new-york-usa');
  });

  it('should not start or end with a hyphen', () => {
    const slug = generateSlug('-Leading', 'Trailing-');
    expect(slug).not.toMatch(/^-/);
    expect(slug).not.toMatch(/-$/);
    expect(slug).toBe('leading-trailing');
  });

  // --- Empty and whitespace inputs ---

  it('should handle empty name', () => {
    expect(generateSlug('', 'France')).toBe('france');
  });

  it('should handle empty country', () => {
    expect(generateSlug('Paris', '')).toBe('paris');
  });

  it('should handle both empty name and country', () => {
    expect(generateSlug('', '')).toBe('');
  });

  it('should handle null name', () => {
    expect(generateSlug(null, 'France')).toBe('france');
  });

  it('should handle null country', () => {
    expect(generateSlug('Paris', null)).toBe('paris');
  });

  it('should handle undefined name', () => {
    expect(generateSlug(undefined, 'France')).toBe('france');
  });

  it('should handle undefined country', () => {
    expect(generateSlug('Paris', undefined)).toBe('paris');
  });

  it('should handle whitespace-only name', () => {
    expect(generateSlug('   ', 'France')).toBe('france');
  });

  it('should handle whitespace-only country', () => {
    expect(generateSlug('Paris', '   ')).toBe('paris');
  });

  it('should handle both whitespace-only inputs', () => {
    expect(generateSlug('   ', '   ')).toBe('');
  });

  // --- Output format validation ---

  it('should only contain lowercase letters, digits, and hyphens', () => {
    const slug = generateSlug('Côte d\'Azur!@#$%', 'France 123');
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('should not contain consecutive hyphens', () => {
    const slug = generateSlug('Hello   World', 'Test   Country');
    expect(slug).not.toMatch(/--/);
  });
});
