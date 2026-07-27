const { Server } = require('socket.io');

let io;

// Initializes Socket.IO on top of the existing HTTP server.
// Room-based broadcasting: each project gets its own room so updates only
// reach users currently viewing that project's workspace.
const initSocket = (httpServer) => {
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    // Helps clients reconnect automatically after a network drop
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client joins a project-specific room to receive scoped real-time updates
    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Lets controllers emit events without importing socket.io directly
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket(server) first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
