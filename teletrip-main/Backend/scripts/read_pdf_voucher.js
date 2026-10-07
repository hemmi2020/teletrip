const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, '../../TT Test booking Voucher.pdf');

if (!fs.existsSync(pdfPath)) {
    console.error('PDF file not found:', pdfPath);
    process.exit(1);
}

const buffer = fs.readFileSync(pdfPath);
const text = buffer.toString('utf8');

// Extract readable ASCII strings from PDF buffer
const strings = text.match(/[\x20-\x7E]{4,}/g) || [];

console.log(`=== EXTRACTED TEXT FROM VOUCHER PDF ===\n`);
const relevantText = strings.filter(s =>
    !s.startsWith('/') &&
    !s.startsWith('%') &&
    !s.includes('Font') &&
    !s.includes('Color') &&
    s.length > 3
);

console.log(relevantText.join('\n'));
