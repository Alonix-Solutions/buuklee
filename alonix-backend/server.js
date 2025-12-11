const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const bookingRoutes = require('./routes/bookings');
const clubRoutes = require('./routes/clubs');
const notificationRoutes = require('./routes/notifications');
const sosRoutes = require('./routes/sos');
const uploadRoutes = require('./routes/upload');
const whatsappRoutes = require('./routes/whatsapp');
const paymentRoutes = require('./routes/payments');
const hotelRoutes = require('./routes/hotels');
const restaurantRoutes = require('./routes/restaurants');
const postRoutes = require('./routes/posts');
const vehicleRoutes = require('./routes/vehicles');
const reviewRoutes = require('./routes/reviews');
const rideRoutes = require('./routes/rides');
const roommateRoutes = require('./routes/roommates');
const driverRoutes = require('./routes/drivers');
const socketHandler = require('./socket/socketHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // allow all origins
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/roommates', roommateRoutes);

// Socket.IO connection handler
socketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`\n❌ [${timestamp}] ERROR in ${req.method} ${req.url}`);
  console.error(`├─ Status: ${statusCode}`);
  console.error(`├─ Message: ${message}`);
  console.error(`├─ IP: ${req.ip}`);

  if (err.name) {
    console.error(`├─ Type: ${err.name}`);
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`└─ Stack:\n${err.stack}\n`);
  } else {
    console.error(`└─ Stack: ${err.stack?.split('\n')[0]}\n`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n⚠️ [${timestamp}] 404 Not Found: ${req.method} ${req.url}`);
  console.log(`└─ IP: ${req.ip}\n`);

  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://pascalgihozo:Ailey@123@alonix-cluster.nc856v9.mongodb.net/alonix?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Alonix Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };
