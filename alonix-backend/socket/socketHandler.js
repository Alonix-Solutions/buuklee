const { verifyToken } = require('../utils/jwt');
const ActivitySession = require('../models/ActivitySession');
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');

/**
 * Socket.IO event handler
 */
module.exports = (io) => {
  // Store authenticated sockets
  const authenticatedSockets = new Map();

  io.on('connection', (socket) => {
    const timestamp = new Date().toISOString();
    console.log(`\n🔌 [${timestamp}] Socket connected`);
    console.log(`├─ Socket ID: ${socket.id}`);
    console.log(`└─ IP: ${socket.handshake.address}\n`);

    /**
     * Authenticate socket connection
     */
    socket.on('authenticate', async (data) => {
      try {
        const { token } = data;

        if (!token) {
          socket.emit('error', { message: 'Token required' });
          return;
        }

        // Verify JWT token
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Store user info in socket
        socket.userId = user._id.toString();
        socket.userName = user.name;
        authenticatedSockets.set(socket.id, socket);

        socket.emit('authenticated', {
          userId: socket.userId,
          userName: socket.userName
        });

        const authTimestamp = new Date().toISOString();
        console.log(`\n✅ [${authTimestamp}] Socket authenticated`);
        console.log(`├─ User: ${socket.userName}`);
        console.log(`├─ User ID: ${socket.userId}`);
        console.log(`└─ Socket ID: ${socket.id}\n`);
      } catch (error) {
        const errorTimestamp = new Date().toISOString();
        console.error(`\n❌ [${errorTimestamp}] Socket authentication failed`);
        console.error(`├─ Socket ID: ${socket.id}`);
        console.error(`├─ Error: ${error.message}`);
        console.error(`└─ Stack: ${error.stack?.split('\n')[0]}\n`);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    /**
     * Join activity room for real-time updates
     */
    socket.on('join-activity', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { activityId, userId } = data;

        // Verify user ID matches authenticated socket
        if (userId !== socket.userId) {
          socket.emit('error', { message: 'User ID mismatch' });
          return;
        }

        // Join the activity room
        socket.join(activityId);
        socket.currentActivityId = activityId;

        const joinTimestamp = new Date().toISOString();
        console.log(`\n👥 [${joinTimestamp}] User joined activity`);
        console.log(`├─ User: ${socket.userName}`);
        console.log(`├─ Activity ID: ${activityId}`);
        console.log(`└─ Socket ID: ${socket.id}\n`);

        // Notify others in the room
        socket.to(activityId).emit('participant-joined', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });

        socket.emit('joined-activity', {
          activityId,
          message: 'Successfully joined activity room'
        });
      } catch (error) {
        console.error('Join activity error:', error);
        socket.emit('error', { message: 'Failed to join activity' });
      }
    });

    /**
     * Leave activity room
     */
    socket.on('leave-activity', (data) => {
      try {
        const { activityId } = data;

        socket.leave(activityId);

        console.log(`👋 ${socket.userName} left activity room: ${activityId}`);

        // Notify others
        socket.to(activityId).emit('participant-left', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Leave activity error:', error);
      }
    });

    /**
     * Location update from participant
     */
    socket.on('location-update', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { activityId, userId, location, stats, health } = data;

        // Verify user
        if (userId !== socket.userId) {
          socket.emit('error', { message: 'User ID mismatch' });
          return;
        }

        // Update session in database
        const session = await ActivitySession.findOne({
          activityId,
          status: 'active'
        });

        if (session) {
          await session.updateParticipantLocation(userId, location, stats);

          // Calculate group stats
          await session.calculateGroupStats();

          // Check for safety alerts
          const alerts = session.checkSafetyAlerts(userId);

          if (alerts.length > 0) {
            // Send safety alerts to organizer and participants
            io.to(activityId).emit('safety-alert', {
              userId,
              userName: socket.userName,
              alerts,
              location: location.coordinates
            });
          }
        }

        // Broadcast location to all participants in the room
        socket.to(activityId).emit('participant-location', {
          userId,
          userName: socket.userName,
          location: location.coordinates,
          stats,
          health,
          timestamp: new Date()
        });

        // Send acknowledgment
        socket.emit('location-updated', {
          success: true,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    /**
     * SOS Emergency Alert
     */
    socket.on('sos-alert', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { activityId, userId, location, reason } = data;

        // Verify user
        if (userId !== socket.userId) {
          socket.emit('error', { message: 'User ID mismatch' });
          return;
        }

        console.log(`🚨 SOS ALERT from ${socket.userName} in activity ${activityId}`);

        // Create SOS alert in database
        const alert = new SOSAlert({
          userId,
          activityId,
          location: {
            type: 'Point',
            coordinates: location.coordinates || location,
            address: location.address
          },
          type: 'manual',
          reason: reason || 'Emergency SOS',
          severity: 'critical'
        });

        await alert.save();

        // Broadcast to EVERYONE in the activity
        io.to(activityId).emit('emergency-alert', {
          alertId: alert._id,
          userId,
          userName: socket.userName,
          location: location.coordinates || location,
          reason,
          timestamp: new Date()
        });

        // Send confirmation to sender
        socket.emit('sos-sent', {
          success: true,
          alertId: alert._id,
          message: 'SOS alert sent to all participants'
        });
      } catch (error) {
        console.error('SOS alert error:', error);
        socket.emit('error', { message: 'Failed to send SOS alert' });
      }
    });

    /**
     * Participant status update (active, paused, completed)
     */
    socket.on('status-update', async (data) => {
      try {
        const { activityId, userId, status } = data;

        if (userId !== socket.userId) return;

        // Broadcast status change
        socket.to(activityId).emit('participant-status', {
          userId,
          userName: socket.userName,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Status update error:', error);
      }
    });

    /**
     * Chat message in activity
     */
    socket.on('send-message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { activityId, message } = data;

        // Broadcast message to room
        io.to(activityId).emit('new-message', {
          userId: socket.userId,
          userName: socket.userName,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    /**
     * Request group statistics
     */
    socket.on('get-group-stats', async (data) => {
      try {
        const { activityId } = data;

        const session = await ActivitySession.findOne({
          activityId,
          status: 'active'
        });

        if (session) {
          socket.emit('group-stats', {
            stats: session.groupStats,
            participantCount: session.participants.length,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Get group stats error:', error);
      }
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);

      if (socket.currentActivityId && socket.userId) {
        // Notify others in the room
        socket.to(socket.currentActivityId).emit('participant-disconnected', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });
      }

      authenticatedSockets.delete(socket.id);
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO handler initialized');
};
