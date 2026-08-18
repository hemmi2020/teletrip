// Disable TLS certificate verification for test environment
// Required because Hotelbeds test API cert chain isn't fully trusted by Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Socket.IO setup with CORS matching frontend
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://telitrip.onrender.com',
      'https://www.telitrip.com',
      'https://telitrip.com',
      'https://telitrip-frontend.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`[Socket] Error from ${socket.id}:`, error);
  });
});

// Make io available globally for other modules to emit events
app.set('io', io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`[Socket] Socket.IO ready on port ${port}`);
});
