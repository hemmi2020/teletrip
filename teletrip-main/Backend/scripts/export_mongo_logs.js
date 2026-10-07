const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const CertificationLogSchema = new mongoose.Schema({
    step: String,
    request: Object,
    response: Object,
    timestamp: { type: Date, default: Date.now }
}, { collection: 'certificationlogs' });

const CertificationLog = mongoose.models.CertificationLog || mongoose.model('CertificationLog', CertificationLogSchema);

async function exportLogs() {
    try {
        const mongoUri = process.env.DB_CONNECT || process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('DB_CONNECT is not set in environment.');
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const logs = await CertificationLog.find().sort({ timestamp: 1 }).lean();
        const formattedLogs = logs.map(({ _id, __v, ...rest }) => rest);

        console.log(`Found ${formattedLogs.length} certification logs in DB.`);

        const targetPath = path.join(__dirname, '../../hotelbeds_certification_logs.json');
        fs.writeFileSync(targetPath, JSON.stringify(formattedLogs, null, 2), 'utf8');
        console.log(`Exported logs to: ${targetPath}`);

        mongoose.disconnect();
    } catch (err) {
        console.error('Error exporting logs:', err.message);
        process.exit(1);
    }
}

exportLogs();
