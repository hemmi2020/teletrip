// Disable TLS certificate verification for test environment
// Required because Hotelbeds test API cert chain isn't fully trusted by Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});