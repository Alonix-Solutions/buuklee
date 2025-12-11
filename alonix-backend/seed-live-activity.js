/**
 * Seed script to create a live activity with pascal@alonixs.com as organizer
 * Run with: node seed-live-activity.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alonix';

// Import models
const User = require('./models/User');
const Activity = require('./models/Activity');

async function seedLiveActivity() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find or create the organizer user
        console.log('\n👤 Looking for organizer user pascal@alonixs.com...');
        let organizer = await User.findOne({ email: 'pascal@alonixs.com' });

        if (!organizer) {
            console.log('Creating organizer user...');
            organizer = await User.create({
                name: 'Pascal Alonix',
                email: 'pascal@alonixs.com',
                password: 'Ailey@123', // Will be hashed by the model
                phone: '+230 5700 0000',
                profilePhoto: 'https://i.pravatar.cc/150?img=33',
                bio: 'Activity organizer and fitness enthusiast | Mauritius',
                location: 'Port Louis, Mauritius',
                role: 'user',
                isVerified: true,
                stats: {
                    totalActivitiesCreated: 1,
                    totalActivitiesJoined: 0,
                    totalDistance: 0
                }
            });
            console.log('✅ Created organizer:', organizer.name);
        } else {
            console.log('✅ Found organizer:', organizer.name);
        }

        // Check if live activity already exists
        const existingLiveActivity = await Activity.findOne({
            organizerId: organizer._id,
            status: 'live'
        });

        if (existingLiveActivity) {
            console.log('\n⚡ Live activity already exists:');
            console.log('  Title:', existingLiveActivity.title);
            console.log('  ID:', existingLiveActivity._id);
            console.log('  Status:', existingLiveActivity.status);

            await mongoose.connection.close();
            console.log('\n🔒 Connection closed');
            return;
        }

        // Create a LIVE activity - happening now!
        console.log('\n🏃 Creating live activity...');
        const now = new Date();
        const endTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

        const liveActivity = await Activity.create({
            title: 'Live Sunrise Trail Run - Le Morne',
            description: 'Join us for an epic LIVE trail run around Le Morne! We\'re currently active and tracking live. Participants can join in real-time and track each other\'s progress on the map.',
            organizerId: organizer._id,
            activityType: 'running',
            difficulty: 'medium',
            date: now,
            startTime: now,
            endTime: endTime,
            distance: 8500, // 8.5km in meters
            elevation: 450, // meters
            entryFee: 0,
            currency: 'MUR',
            maxParticipants: 20,
            currentParticipants: 1, // Organizer is a participant
            participants: [{
                userId: organizer._id,
                joinedAt: now,
                status: 'confirmed',
                paymentStatus: 'paid'
            }],
            meetingPoint: {
                address: 'Le Morne Beach Parking, Mauritius',
                type: 'Point',
                coordinates: [57.3218, -20.4552] // [longitude, latitude]
            },
            route: {
                type: 'LineString',
                coordinates: [
                    [57.3218, -20.4552], // Start - Le Morne Beach
                    [57.3195, -20.4575], // Waypoint 1
                    [57.3172, -20.4598], // Waypoint 2 - Trail start
                    [57.3150, -20.4580], // Waypoint 3 - Viewpoint
                    [57.3165, -20.4540], // Waypoint 4 - Summit trail
                    [57.3200, -20.4510], // Waypoint 5 - Ridge
                    [57.3230, -20.4535], // Waypoint 6 - Descent
                    [57.3218, -20.4552]  // End - Back to start
                ]
            },
            photos: [
                'https://picsum.photos/seed/lemorne1/800/400',
                'https://picsum.photos/seed/lemorne2/800/400'
            ],
            status: 'live', // This is the key - it's LIVE now!
            isPublic: true,
            tags: ['trail-run', 'sunrise', 'le-morne', 'live', 'scenic'],
            weatherConditions: {
                temperature: 24,
                condition: 'Partly Cloudy',
                wind: 12
            }
        });

        console.log('\n✅ Created LIVE activity:');
        console.log('─'.repeat(40));
        console.log('  Title:', liveActivity.title);
        console.log('  ID:', liveActivity._id);
        console.log('  Status:', liveActivity.status);
        console.log('  Activity Type:', liveActivity.activityType);
        console.log('  Distance:', liveActivity.distance / 1000, 'km');
        console.log('  Elevation:', liveActivity.elevation, 'm');
        console.log('  Max Participants:', liveActivity.maxParticipants);
        console.log('  Organizer:', organizer.name, `(${organizer.email})`);
        console.log('─'.repeat(40));

        console.log('\n🎉 Live activity seeded successfully!');
        console.log('📍 You can view it on the home screen and live map');
        console.log('👤 Login as pascal@alonixs.com / Ailey@123 to manage it');

        await mongoose.connection.close();
        console.log('\n🔒 Connection closed');

    } catch (error) {
        console.error('❌ Error seeding live activity:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the seed
seedLiveActivity();
