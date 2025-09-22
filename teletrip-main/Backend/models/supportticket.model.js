// CREATE THIS FILE: models/supportTicket.model.js

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    ticketNumber: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            return `TT${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 2000
    },
    category: {
        type: String,
        enum: ['booking', 'payment', 'technical', 'general', 'complaint'],
        required: true,
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open',
        index: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    responses: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxLength: 2000
        },
        isInternal: {
            type: Boolean,
            default: false
        },
        attachments: [{
            filename: String,
            url: String,
            size: Number
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    attachments: [{
        filename: String,
        url: String,
        size: Number,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    internalNotes: {
        type: String,
        maxLength: 2000
    },
    lastResponseAt: {
        type: Date,
        default: Date.now
    },
    lastResponseBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    closedAt: Date,
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    metadata: {
        userAgent: String,
        ipAddress: String,
        platform: String
    },
    satisfaction: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String,
        ratedAt: Date
    }
}, {
    timestamps: true
});

// Add pagination plugin
supportTicketSchema.plugin(mongoosePaginate);

// Indexes for better performance
supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ category: 1, priority: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ createdAt: -1 });

// Virtual for response count
supportTicketSchema.virtual('responseCount').get(function() {
    return this.responses ? this.responses.length : 0;
});

// Method to add response
supportTicketSchema.methods.addResponse = function(userId, message, isInternal = false) {
    this.responses.push({
        userId,
        message,
        isInternal,
        createdAt: new Date()
    });
    
    if (!isInternal) {
        this.lastResponseAt = new Date();
        this.lastResponseBy = userId;
    }
    
    return this.save();
};

// Method to assign ticket
supportTicketSchema.methods.assignTo = function(adminUserId) {
    this.assignedTo = adminUserId;
    this.status = 'in_progress';
    return this.save();
};

// Method to resolve ticket
supportTicketSchema.methods.resolve = function(resolvedBy) {
    this.status = 'resolved';
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    return this.save();
};

// Method to close ticket
supportTicketSchema.methods.close = function(closedBy) {
    this.status = 'closed';
    this.closedAt = new Date();
    this.closedBy = closedBy;
    return this.save();
};

// Static method to get ticket statistics
supportTicketSchema.statics.getStats = async function(timeframe = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    
    const stats = await this.aggregate([
        {
            $facet: {
                byStatus: [
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ],
                byPriority: [
                    { $group: { _id: '$priority', count: { $sum: 1 } } }
                ],
                byCategory: [
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ],
                recent: [
                    { $match: { createdAt: { $gte: startDate } } },
                    { $count: 'total' }
                ],
                avgResolutionTime: [
                    { 
                        $match: { 
                            status: 'resolved',
                            resolvedAt: { $exists: true }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgTime: {
                                $avg: {
                                    $divide: [
                                        { $subtract: ['$resolvedAt', '$createdAt'] },
                                        1000 * 60 * 60 // Convert to hours
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    ]);
    
    return stats[0];
};

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;