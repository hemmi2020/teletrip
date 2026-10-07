const fs = require('fs');
const path = require('path');

const logFilePath = 'c:/wamp64/www/telitrip/Certification/hotelbeds_certification_logs.json';

if (!fs.existsSync(logFilePath)) {
    console.error('File not found:', logFilePath);
    process.exit(1);
}

const rawData = fs.readFileSync(logFilePath, 'utf8');
let logs;
try {
    logs = JSON.parse(rawData);
} catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
}

console.log(`\n======================================================================`);
console.log(`           HOTELBEDS / HBX CERTIFICATION LOG AUDIT REPORT             `);
console.log(`======================================================================`);
console.log(`File: ${logFilePath}`);
console.log(`Total Log Entries: ${logs.length}\n`);

const stepsCount = {};
const endpoints = { mtls: 0, nonMtls: 0, other: [] };
const headerStats = {
    apiKeyCount: 0,
    signatureCount: 0,
    gzipCount: 0,
    missingGzip: []
};

const availabilityEntries = [];
const checkRateEntries = [];
const bookingEntries = [];
const cancelEntries = [];
const otherEntries = [];

logs.forEach((log, index) => {
    const step = log.step || 'Unknown';
    stepsCount[step] = (stepsCount[step] || 0) + 1;

    const req = log.request || {};
    const url = req.url || req.endpoint || '';
    const headers = req.headers || {};
    
    // Check mTLS
    if (url.includes('api-mtls.test.hotelbeds.com') || url.includes('api-mtls.hotelbeds.com')) {
        endpoints.mtls++;
    } else if (url.includes('api.test.hotelbeds.com') || url.includes('api.hotelbeds.com')) {
        endpoints.nonMtls++;
        endpoints.other.push({ index, step, url });
    }

    // Check Headers (case-insensitive keys)
    const headerKeys = Object.keys(headers).map(k => k.toLowerCase());
    if (headerKeys.includes('api-key')) headerStats.apiKeyCount++;
    if (headerKeys.includes('x-signature')) headerStats.signatureCount++;
    
    const hasGzip = headerKeys.some(k => k === 'accept-encoding' && headers[k]?.includes('gzip')) ||
                    headers['Accept-Encoding']?.includes('gzip') ||
                    headers['accept-encoding']?.includes('gzip');
    
    if (hasGzip) {
        headerStats.gzipCount++;
    } else {
        headerStats.missingGzip.push({ index, step, url, headers });
    }

    // Categorize by Step / Workflow
    const stepLower = step.toLowerCase();
    const urlLower = url.toLowerCase();
    if (stepLower.includes('avail') || urlLower.endsWith('/hotels') || stepLower.includes('search')) {
        availabilityEntries.push({ index, log });
    } else if (stepLower.includes('checkrate') || urlLower.includes('/checkrates')) {
        checkRateEntries.push({ index, log });
    } else if (stepLower.includes('cancel') || req.method === 'DELETE' || urlLower.includes('cancel')) {
        cancelEntries.push({ index, log });
    } else if (stepLower.includes('book') || stepLower.includes('confirm') || (urlLower.includes('/bookings') && req.method === 'POST')) {
        bookingEntries.push({ index, log });
    } else {
        otherEntries.push({ index, log });
    }
});

console.log(`--- 1. Step Distribution ---`);
for (const [s, count] of Object.entries(stepsCount)) {
    console.log(`  - ${s}: ${count} call(s)`);
}

console.log(`\n--- 2. Endpoint Compliance (mTLS) ---`);
console.log(`  - mTLS Endpoints (api-mtls.*): ${endpoints.mtls} / ${logs.length}`);
if (endpoints.nonMtls > 0) {
    console.log(`  ❌ Non-mTLS Endpoints Detected: ${endpoints.nonMtls}`);
    endpoints.other.slice(0, 5).forEach(e => console.log(`     [#${e.index}] ${e.step}: ${e.url}`));
} else {
    console.log(`  ✅ 100% of calls use official mTLS endpoints (api-mtls.test.hotelbeds.com)`);
}

console.log(`\n--- 3. Mandatory Wire Headers ---`);
console.log(`  - Api-key present: ${headerStats.apiKeyCount} / ${logs.length}`);
console.log(`  - X-Signature present: ${headerStats.signatureCount} / ${logs.length}`);
console.log(`  - Accept-Encoding: gzip present: ${headerStats.gzipCount} / ${logs.length}`);
if (headerStats.missingGzip.length > 0) {
    console.log(`  ⚠️ Entries missing Accept-Encoding: gzip (${headerStats.missingGzip.length}):`);
    headerStats.missingGzip.slice(0, 5).forEach(m => console.log(`     [#${m.index}] ${m.step}: ${m.url}`));
} else {
    console.log(`  ✅ 100% of requests transmit Accept-Encoding: gzip`);
}

console.log(`\n--- 4. Booking Flow Sequence Analysis ---`);
console.log(`  - Availability Searches: ${availabilityEntries.length}`);
console.log(`  - CheckRate Validations: ${checkRateEntries.length}`);
console.log(`  - Booking Confirmations: ${bookingEntries.length}`);
console.log(`  - Booking Cancellations: ${cancelEntries.length}`);

// Detailed Check on Booking Entries
if (bookingEntries.length > 0) {
    console.log(`\n--- 5. Booking Payload Compliance ---`);
    bookingEntries.forEach(({ index, log }, i) => {
        const req = log.request || {};
        const res = log.response || {};
        const body = req.body || {};
        const resData = res.data || res.body || res;
        const b = resData.booking || resData;

        console.log(`\n  [Booking #${i + 1} (Log Entry #${index})]`);
        console.log(`    - URL: ${req.url}`);
        console.log(`    - Client Reference: ${body.clientReference || 'N/A'}`);
        console.log(`    - Hotelbeds Reference: ${b.reference || 'N/A'}`);
        console.log(`    - Status: ${b.status || res.status || 'N/A'}`);
        console.log(`    - Total Net: ${b.totalNet || 'N/A'} ${b.currency || ''}`);
        
        // Check occupancies / children
        const rooms = body.rooms || b.hotel?.rooms || [];
        let totalPaxes = 0;
        let childrenCount = 0;
        let childAges = [];
        rooms.forEach(r => {
            const paxes = r.paxes || [];
            totalPaxes += paxes.length;
            paxes.forEach(p => {
                if (p.type === 'CH' || p.age < 18) {
                    childrenCount++;
                    childAges.push(p.age);
                }
            });
        });
        console.log(`    - Paxes Count: ${totalPaxes}`);
        console.log(`    - Children Included: ${childrenCount > 0 ? `Yes (${childAges.join(', ')} yrs)` : 'No (Adults only)'}`);
        if (body.sourceMarket) {
            console.log(`    ⚠️ Warning: sourceMarket found in Booking payload: ${body.sourceMarket} (HBX recommends sourceMarket only in Availability)`);
        }
    });
}

// Detailed Check on Cancellation Entries
if (cancelEntries.length > 0) {
    console.log(`\n--- 6. Cancellation Compliance ---`);
    cancelEntries.forEach(({ index, log }, i) => {
        const req = log.request || {};
        const res = log.response || {};
        const resData = res.data || res.body || res;
        const b = resData.booking || resData;
        console.log(`\n  [Cancellation #${i + 1} (Log Entry #${index})]`);
        console.log(`    - Method: ${req.method} ${req.url}`);
        console.log(`    - Status: ${b.status || 'N/A'}`);
        console.log(`    - Cancellation Reference: ${b.cancellationReference || b.reference || 'N/A'}`);
        console.log(`    - Cancellation Charge (totalNet): ${b.totalNet || '0.00'} ${b.currency || 'EUR'}`);
    });
}

// Detailed Check on Availability Entries
if (availabilityEntries.length > 0) {
    console.log(`\n--- 7. Availability Compliance ---`);
    const sampleAvail = availabilityEntries[availabilityEntries.length - 1].log;
    const req = sampleAvail.request || {};
    const body = req.body || {};
    console.log(`  Sample Availability (Entry #${availabilityEntries[availabilityEntries.length - 1].index}):`);
    console.log(`    - sourceMarket: ${body.sourceMarket || 'MISSING'}`);
    console.log(`    - Stay: ${JSON.stringify(body.stay || {})}`);
    console.log(`    - Occupancies: ${JSON.stringify(body.occupancies || [])}`);
}

console.log(`\n======================================================================`);
console.log(`                         AUDIT SUMMARY                                `);
console.log(`======================================================================\n`);
