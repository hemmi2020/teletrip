const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullname
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated user ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: User's password (hashed)
 *         fullname:
 *           type: object
 *           properties:
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *         phone:
 *           type: string
 *           description: User's phone number
 *         avatar:
 *           type: string
 *           description: User's profile picture URL
 *         role:
 *           type: string
 *           enum: [user, admin, super_admin, agent, partner]
 *           default: user
 *         isEmailVerified:
 *           type: boolean
 *           default: false
 *         isPhoneVerified:
 *           type: boolean
 *           default: false
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // This creates an index automatically
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  password: {
  type: String,
  required: function() {
    return !this.googleId; // Only required if not using Google OAuth
  },
},
  
  fullname: {
    firstname: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    }
  },
  
  phone: {
    type: String,
    trim: true,
    sparse: true, // Allow null values but create index for non-null values
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  dateOfBirth: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  googleId: {
  type: String,
  unique: true,
  sparse: true, // Allows null but enforces uniqueness
},
profilePicture: {
  type: String,
  default: null,
},
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  customerId: {
  type: Number,
  unique: true,
  default: () => Math.floor(Math.random() * 10000000) // 7-digit random number
},
  
  avatar: {
    type: String,
    default: null
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin', 'agent', 'partner'],
    default: 'user',
    index: true // Create index for role queries
  },
  
  permissions: [{
    type: String,
    enum: [
      'read_users', 'write_users', 'delete_users',
      'read_bookings', 'write_bookings', 'delete_bookings',
      'read_payments', 'write_payments', 'refund_payments',
      'read_reports', 'write_reports',
      'manage_content', 'manage_settings',
      'manage_promotions', 'manage_loyalty'
    ]
  }],
  
  // Account status and verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active',
    index: true // Create index for status queries
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  
  // Two-factor authentication
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorBackupCodes: [String],
  
  // Social logins
  socialLogins: {
    google: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    }
  },
  
  // User preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ur'],
      default: 'en'
    },
    currency: {
      type: String,
      enum: ['PKR', 'USD', 'EUR', 'GBP'],
      default: 'PKR'
    },
    timezone: {
      type: String,
      default: 'Asia/Karachi'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      },
      bookingUpdates: {
        type: Boolean,
        default: true
      },
      paymentAlerts: {
        type: Boolean,
        default: true
      }
    },
  
  // Travel preferences
  travelPreferences: {
    preferredAirlines: [String],
    seatPreference: {
      type: String,
      enum: ['window', 'aisle', 'middle', 'no_preference'],
      default: 'no_preference'
    },
    mealPreference: {
      type: String,
      enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'none'],
      default: 'none'
    },
    accommodationType: {
      type: String,
      enum: ['hotel', 'resort', 'apartment', 'hostel', 'any'],
      default: 'any'
    },
    roomPreference: {
      type: String,
      enum: ['single', 'double', 'twin', 'suite', 'any'],
      default: 'any'
    },
    roomPreferences: {
      bedType: {
        type: String,
        enum: ['single', 'double', 'twin', 'king', 'queen'],
        default: 'double'
      },
      smokingPreference: {
        type: String,
        enum: ['non_smoking', 'smoking', 'no_preference'],
        default: 'non_smoking'
      },
      floorPreference: {
        type: String,
        enum: ['low', 'high', 'no_preference'],
        default: 'no_preference'
      },
      viewPreference: {
        type: String,
        enum: ['sea', 'city', 'garden', 'mountain', 'no_preference'],
        default: 'no_preference'
      },
    },
  },
  preferredAmenities: [{
      type: String,
      enum: [
        'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar',
        'room_service', 'laundry', 'concierge', 'business_center',
        'conference_rooms', 'elevator', 'ac', 'heating', 'pet_friendly'
      ]
    }],
    
    // 🔥 FIX: Add the missing favoriteHotels field
    favoriteHotels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel'
    }],
    
    // Dietary and accessibility preferences
    dietaryRequirements: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'dairy_free', 'nut_free']
    }],
    
    accessibilityNeeds: [{
      type: String,
      enum: ['wheelchair_accessible', 'hearing_impaired', 'visually_impaired', 'mobility_assistance']
    }],
    
    // Budget preferences
    budgetRange: {
      min: {
        type: Number,
        min: 0,
        default: 0
      },
      max: {
        type: Number,
        min: 0,
        default: 50000
      }
    },
    
    // Privacy settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'private'
      },
      showBookingHistory: {
        type: Boolean,
        default: false
      },
      allowDataSharing: {
        type: Boolean,
        default: false
      }
    },
    
    // Marketing preferences
    marketing: {
      emailOffers: {
        type: Boolean,
        default: false
      },
      smsOffers: {
        type: Boolean,
        default: false
      },
      personalizedRecommendations: {
        type: Boolean,
        default: true
      }
    }
},
  
  // Loyalty program
  loyaltyProgram: {
    memberId: {
      type: String,
      unique: true,
      sparse: true // Allow null but create unique index for non-null values
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    points: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    totalRedeemed: {
      type: Number,
      default: 0
    }
  },
  
  // Emergency contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Billing information
  billingInfo: {
    defaultPaymentMethod: String,
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },
  
  // Activity tracking
  lastLoginAt: Date,
  lastActiveAt: {
    type: Date,
    index: true // Index for active user queries
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    location: String
  }],
  
  // Security
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  
  // Metadata
  tags: [String], // For admin use (VIP, frequent_traveler, etc.)
  notes: String, // Internal admin notes
  
  // Analytics
  totalBookings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Terms and privacy
  termsAcceptedAt: Date,
  privacyPolicyAcceptedAt: Date,
  marketingConsent: {
    type: Boolean,
    default: false
  },
  marketingConsentDate: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// REMOVED DUPLICATE INDEXES - These are now handled in the schema definition above
// The following indexes are now redundant and have been removed:
// userSchema.index({ email: 1 }); // REMOVED - email field already has unique: true
// userSchema.index({ phone: 1 }); // REMOVED - phone field now has sparse: true 
// userSchema.index({ role: 1 }); // REMOVED - role field now has index: true
// userSchema.index({ status: 1 }); // REMOVED - status field now has index: true
// userSchema.index({ 'loyaltyProgram.memberId': 1 }); // REMOVED - memberId now has unique: true, sparse: true

// Keep only necessary compound indexes that can't be defined in schema fields
userSchema.index({ createdAt: -1 }); // For sorting by creation date
userSchema.index({ lastActiveAt: -1 }); // For active user queries

// Virtual for full name
userSchema.virtual('displayName').get(function() {
  return `${this.fullname.firstname} ${this.fullname.lastname}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for JWT timing
  }
  
  // Generate loyalty member ID
  if (this.isNew && !this.loyaltyProgram.memberId) {
    this.loyaltyProgram.memberId = 'TT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordChangedAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.generateAuthToken = function (){
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
    return token;
  }

  // Static method for hashing password
userSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 12);
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

userSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.phoneVerificationCode = crypto.createHash('sha256').update(code).digest('hex');
  this.phoneVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  return code;
};

userSchema.methods.enable2FA = function() {
  const secret = speakeasy.generateSecret({
    name: `Telitrip (${this.email})`,
    issuer: 'Telitrip'
  });
  
  this.twoFactorSecret = secret.base32;
  
  // Generate backup codes
  const backupCodes = [];
  for (let i = 0; i < 10; i++) {
    backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  this.twoFactorBackupCodes = backupCodes;
  
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url,
    backupCodes
  };
};

userSchema.methods.verify2FA = function(token) {
  if (!this.twoFactorSecret) return false;
  
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

userSchema.methods.incrementFailedLogins = function() {
  // If we have a previous failed attempt and it's not locked yet
  if (this.failedLoginAttempts && !this.isLocked) {
    this.failedLoginAttempts += 1;
  } else {
    this.failedLoginAttempts = 1;
  }
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  }
  
  return this.save();
};

userSchema.methods.resetFailedLogins = function() {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = undefined;
  return this.save();
};

userSchema.methods.addLoginHistory = function(req) {
  const loginEntry = {
    timestamp: new Date(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    location: req.get('CF-IPCountry') || 'Unknown'
  };
  
  this.loginHistory.unshift(loginEntry);
  
  // Keep only last 10 login entries
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(0, 10);
  }
  
  this.lastLoginAt = new Date();
  this.lastActiveAt = new Date();
  
  return this.save();
};

userSchema.methods.updateLoyaltyPoints = function(points, type = 'earn') {
  if (type === 'earn') {
    this.loyaltyProgram.points += points;
    this.loyaltyProgram.totalEarned += points;
  } else if (type === 'redeem') {
    this.loyaltyProgram.points -= points;
    this.loyaltyProgram.totalRedeemed += points;
  }
  
  // Update tier based on total earned points
  const totalEarned = this.loyaltyProgram.totalEarned;
  if (totalEarned >= 100000) {
    this.loyaltyProgram.tier = 'platinum';
  } else if (totalEarned >= 50000) {
    this.loyaltyProgram.tier = 'gold';
  } else if (totalEarned >= 15000) {
    this.loyaltyProgram.tier = 'silver';
  } else {
    this.loyaltyProgram.tier = 'bronze';
  }
  
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        verifiedUsers: {
          $sum: {
            $cond: ['$isEmailVerified', 1, 0]
          }
        },
        adminUsers: {
          $sum: {
            $cond: [{ $in: ['$role', ['admin', 'super_admin']] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0
  };
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.phoneVerificationCode;
  delete userObject.twoFactorSecret;
  delete userObject.twoFactorBackupCodes;
  delete userObject.failedLoginAttempts;
  delete userObject.accountLockedUntil;
  delete userObject.__v;
  
  return userObject;
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;