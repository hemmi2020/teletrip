// Simple in-memory cache for activity details
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

const cacheMiddleware = (req, res, next) => {
  const key = `${req.method}:${req.originalUrl}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, { data, timestamp: Date.now() });
    return originalJson(data);
  };
  
  next();
};

module.exports = { cacheMiddleware };
