const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../hotelbeds_certification_logs.json');

if (!fs.existsSync(logFilePath)) {
    console.error('File not found:', logFilePath);
    process.exit(1);
}

const logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));

console.log(`=== HOTELBEDS CERTIFICATION LOG AUDIT ===`);
console.log(`Total Log Entries: ${logs.length}\n`);

const stepsFound = new Set();
let mtlsCount = 0;
let nonMtlsCount = 0;
let bookingEntries = [];
let cancellationEntries = [];
let checkRateEntries = [];
let availabilityEntries = [];

logs.forEach((entry, idx) => {
    const step = entry.step || 'Unknown';
    stepsFound.add(step);
    const url = entry.request?.url || '';

    if (url.includes('api-mtls.test.hotelbeds.com')) {
        mtlsCount++;
    } else if (url.includes('api.test.hotelbeds.com')) {
        nonMtlsCount++;
    }

    if (step.toLowerCase().includes('booking') || step.toLowerCase().includes('confirm')) {
        bookingEntries.push({ idx, entry });
    } else if (step.toLowerCase().includes('cancel')) {
        cancellationEntries.push({ idx, entry });
    } else if (step.toLowerCase().includes('checkrate')) {
        checkRateEntries.push({ idx, entry });
    } else if (step.toLowerCase().includes('avail')) {
        availabilityEntries.push({ idx, entry });
    }
});

console.log(`Steps Present in Log File: Array.from(stepsFound):`, Array.from(stepsFound));
console.log(`- Availability entries: ${availabilityEntries.length}`);
console.log(`- CheckRate entries: ${checkRateEntries.length}`);
console.log(`- Booking entries: ${bookingEntries.length}`);
console.log(`- Cancellation entries: ${cancellationEntries.length}\n`);

console.log(`=== ENDPOINT AUDIT ===`);
console.log(`- mTLS Endpoints (api-mtls.test.hotelbeds.com): ${mtlsCount}`);
console.log(`- Standard Endpoints (api.test.hotelbeds.com): ${nonMtlsCount}\n`);

if (bookingEntries.length > 0) {
    console.log(`=== BOOKING PAYLOAD ANALYSIS ===`);
    bookingEntries.forEach(({ idx, entry }) => {
        console.log(`\n[Booking Entry #${idx + 1}]`);
        console.log(`URL: ${entry.request?.url}`);
        console.log(`HTTP Status: ${entry.response?.status}`);
        console.log(`Source Marker:`, JSON.stringify(entry.request?.body?.source || 'MISSING'));
        console.log(`Paxes:`, JSON.stringify(entry.request?.body?.holder || entry.request?.body?.rooms?.[0]?.paxes || 'N/A'));
        console.log(`Booking Reference in Response:`, entry.response?.body?.booking?.reference || 'NONE');
    });
} else {
    console.log(`⚠️ NO BOOKING ENTRY FOUND IN LOG FILE!`);
}

if (cancellationEntries.length > 0) {
    console.log(`\n=== CANCELLATION PAYLOAD ANALYSIS ===`);
    cancellationEntries.forEach(({ idx, entry }) => {
        console.log(`\n[Cancellation Entry #${idx + 1}]`);
        console.log(`URL: ${entry.request?.url}`);
        console.log(`HTTP Status: ${entry.response?.status}`);
        console.log(`Cancellation Reference in Response:`, entry.response?.body?.booking?.cancellationReference || entry.response?.body?.booking?.reference || 'NONE');
    });
} else {
    console.log(`\n⚠️ NO CANCELLATION ENTRY FOUND IN LOG FILE!`);
}
