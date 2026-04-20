const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const emailLogSchema = new mongoose.Schema({
    templateSlug: {
        type: String,
        index: true
    },
    templateName: {
        type: String
    },
    recipient: {
        type: String,
        required: true,
        index: true
    },
    recipientUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['queued', 'sent', 'delivered', 'failed', 'bounced'],
        default: 'queued',
        index: true
    },
    type: {
        type: String,
        enum: ['transactional', 'bulk', 'system'],
        default: 'transactional',
        index: true
    },
    messageId: {
        type: String
    },
    error: {
        type: String
    },
    metadata: {
        bulkJobId: {
            type: String
        },
        variables: {
            type: mongoose.Schema.Types.Mixed
        },
        ipAddress: {
            type: String
        }
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

emailLogSchema.plugin(mongoosePaginate);

emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
module.exports = EmailLog;
