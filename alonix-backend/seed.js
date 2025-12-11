const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mauritiusData = require('./data/mauritiusData');

// Load env vars
dotenv.config();

// Import models
const User = require('./models/User');
const Activity = require('./models/Activity');
const Club = require('./models/Club');
const Hotel = require('./models/Hotel');
const Restaurant = require('./models/Restaurant');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alonix', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Activity.deleteMany({});
        await Club.deleteMany({});
        await Hotel.deleteMany({});
        await Restaurant.deleteMany({});

        console.log('Creating Users...');
        const password = await bcrypt.hash('password123', 10);

        const users = await User.create([
            {
                name: 'Pascal Gihozo',
                email: 'pascal@example.com',
                password: password,
                profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
                location: { type: 'Point', coordinates: [57.5012, -20.2012], address: 'Moka, Mauritius' },
                bio: 'Love hiking and running in the nature of Mauritius.',
                stats: { totalDistance: 150000, totalTime: 360000 }
            },
            {
                name: 'Sarah Moorghen',
                email: 'sarah@example.com',
                password: password,
                profilePhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
                location: { type: 'Point', coordinates: [57.5833, -20.2333], address: 'Rose Hill, Mauritius' },
                bio: 'Cycling enthusiast. Catch me on the coastal roads.',
                stats: { totalDistance: 300000, totalTime: 720000 }
            },
            {
                name: 'Jean-Luc Ah-Moy',
                email: 'jeanluc@example.com',
                password: password,
                profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
                location: { type: 'Point', coordinates: [57.5167, -20.1667], address: 'Port Louis, Mauritius' },
                bio: 'Trail runner. Le Morne is my playground.',
                stats: { totalDistance: 50000, totalTime: 120000 }
            },
            {
                name: 'Priya Ramdenee',
                email: 'priya@example.com',
                password: password,
                profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
                location: { type: 'Point', coordinates: [57.3667, -20.2667], address: 'Flic en Flac, Mauritius' },
                bio: 'Beach yoga and morning jogs.',
                stats: { totalDistance: 20000, totalTime: 60000 }
            }
        ]);

        console.log('Creating Clubs...');
        const clubs = await Club.create([
            {
                name: 'Mauritius Hiking Club',
                description: 'Exploring the best trails in Mauritius every weekend.',
                location: { type: 'Point', coordinates: [57.5012, -20.2012], address: 'Moka' },
                coverPhoto: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop',
                members: [
                    { userId: users[0]._id, role: 'admin' },
                    { userId: users[2]._id, role: 'member' }
                ],
                creatorId: users[0]._id,
                category: 'Hiking'
            },
            {
                name: 'North Coast Cyclists',
                description: 'Road cycling group for the northern region.',
                location: { type: 'Point', coordinates: [57.5833, -20.0167], address: 'Grand Baie' },
                coverPhoto: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1000&auto=format&fit=crop',
                members: [
                    { userId: users[1]._id, role: 'admin' }
                ],
                creatorId: users[1]._id,
                category: 'Cycling'
            }
        ]);

        console.log('Creating Activities...');
        const activityPromises = mauritiusData.activities.map(activity => {
            // Assign random organizer and participants
            const organizer = users[Math.floor(Math.random() * users.length)];
            const participants = users.slice(0, Math.floor(Math.random() * users.length) + 1).map(u => ({ userId: u._id }));

            return Activity.create({
                ...activity,
                date: new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 10) + 1)), // Random date in next 10 days
                organizerId: organizer._id,
                participants: participants,
                status: 'upcoming'
            });
        });
        await Promise.all(activityPromises);

        console.log('Creating Hotels...');
        await Hotel.create(mauritiusData.hotels);

        console.log('Creating Restaurants...');
        await Restaurant.create(mauritiusData.restaurants);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
