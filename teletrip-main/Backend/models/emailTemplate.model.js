const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const emailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[a-z0-9_]+$/.test(v);
            },
            message: 'Slug must contain only lowercase letters, numbers, and underscores'
        }
    },
    category: {
        type: String,
        enum: ['booking', 'payment', 'account', 'support', 'marketing', 'system'],
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    htmlContent: {
        type: String,
        required: true
    },
    textContent: {
        type: String
    },
    variables: [{
        key: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(v);
                },
                message: 'Variable key must start with a letter and contain only letters, numbers, and underscores'
            }
        },
        description: {
            type: String
        },
        defaultValue: {
            type: String,
            default: ''
        },
        required: {
            type: Boolean,
            default: false
        }
    }],
    sampleData: {
        type: mongoose.Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    version: {
        type: Number,
        default: 1
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metadata: {
        sendCount: {
            type: Number,
            default: 0
        },
        lastSentAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

emailTemplateSchema.plugin(mongoosePaginate);

emailTemplateSchema.index({ slug: 1, isActive: 1, isDeleted: 1 });

// Pre-save hook to auto-increment version on update
emailTemplateSchema.pre('save', function (next) {
    if (!this.isNew && this.isModified()) {
        this.version += 1;
    }
    next();
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
module.exports = EmailTemplate;
