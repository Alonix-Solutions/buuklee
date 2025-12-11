const mongoose = require('mongoose');
require('dotenv').config();

const addParticipant = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Activity = mongoose.model('Activity', require('./models/Activity').schema);
    
    const userId = '693737e65ad87f8b01dd10db'; // Your user ID
    const activityId = '693747ecbadc6ce39b24c582'; // Morning Run Test
    
    const activity = await Activity.findById(activityId);
    
    if (!activity) {
      console.log('❌ Activity not found');
      process.exit(1);
    }
    
    console.log('📋 Activity:', activity.title);
    console.log('👥 Current participants:', activity.currentParticipants);
    
    // Check if already participant
    const isAlready = activity.participants.some(p => 
      (p.userId?._id || p.userId).toString() === userId
    );
    
    if (isAlready) {
      console.log('✅ You are already a participant!');
    } else {
      console.log('➕ Adding you as participant...');
      activity.participants.push({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'confirmed',
        paymentStatus: 'pending', // Use 'pending' instead of 'free'
        joinedAt: new Date()
      });
      activity.currentParticipants += 1;
      await activity.save();
      console.log('✅ Added successfully!');
    }
    
    console.log('\n📊 Final participants:', activity.currentParticipants);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addParticipant();
