require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { initSocket } = require('./socket');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ---------- Core Middleware ----------
// CLIENT_URL can be a single origin or a comma-separated list (e.g. local dev +
// deployed frontend), which is common once the app is split across two hosts.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, health checks) that send no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve temporarily uploaded files (before/if they get pushed to Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Health Check ----------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// ---------- Routes ----------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// ---------- Error Handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- HTTP + Socket.IO Server ----------
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Safety net: log unhandled promise rejections instead of crashing silently
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
