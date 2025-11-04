const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklistToken.model');

const authUser = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = (req.cookies?.token) || 
                      (req.headers.authorization?.startsWith('Bearer ') ?
                       req.headers.authorization.split(' ')[1] : null);

        console.log('Raw token:', token);
        console.log('Token type:', typeof token);
        console.log('Cookies:', req.cookies);
        console.log('Authorization header:', req.headers.authorization);

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Validate token format
        if (typeof token !== 'string' || token.split('.').length !== 3) {
            console.log('Token parts:', token?.split('.').length);
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await blacklistTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error('Auth error:', err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        return res.status(401).json({ message: 'Authentication failed' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. Authentication required.' });
        }

        // Check if user has role field, if not assume 'user' role
        const userRole = req.user.role || 'user';
        
        if (!roles.includes(userRole)) {
            return res.status(403).json({ 
                message: 'Access denied. Insufficient permissions.',
                required: roles,
                current: userRole
            });
        }

        next();
    };
};

// Add optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = (req.cookies?.token) || 
                      (req.headers.authorization?.startsWith('Bearer ') ?
                       req.headers.authorization.split(' ')[1] : null);

        if (token && typeof token === 'string' && token.split('.').length === 3) {
            // Check if token is blacklisted
            const isBlacklisted = await blacklistTokenModel.findOne({ token });
            if (!isBlacklisted) {
                // Verify token and get user
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await userModel.findById(decoded._id);
                
                if (user) {
                    req.user = user;
                }
            }
        }
    } catch (error) {
        // Ignore errors for optional auth
        console.log('Optional auth failed:', error.message);
    }
    
    next();
};
 
// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.token || 
                      (req.headers.authorization?.startsWith('Bearer ') ?
                       req.headers.authorization.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const isBlacklisted = await blacklistTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = { authUser, requireRole, optionalAuth, authenticateAdmin };
