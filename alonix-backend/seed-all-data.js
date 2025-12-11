/**
 * Seed script to populate drivers, vehicles, and posts with sample data
 * Run with: node seed-all-data.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alonix';

// Import models
const User = require('./models/User');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const Post = require('./models/Post');
const Activity = require('./models/Activity');

async function seedAllData() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get or create users for seeding
        console.log('👤 Setting up users...');
        let users = await User.find().limit(5);

        if (users.length < 3) {
            console.log('Creating sample users...');
            const sampleUsers = [
                {
                    name: 'Jean-Marc Dupont',
                    email: 'jeanmarc@example.com',
                    password: 'Test@123',
                    phone: '+230 5700 1111',
                    profilePhoto: 'https://i.pravatar.cc/150?img=11',
                    bio: 'Cycling enthusiast and tour guide',
                    location: 'Grand Baie, Mauritius',
                    isVerified: true
                },
                {
                    name: 'Sophie Laval',
                    email: 'sophie@example.com',
                    password: 'Test@123',
                    phone: '+230 5700 2222',
                    profilePhoto: 'https://i.pravatar.cc/150?img=5',
                    bio: 'Trail runner and adventure seeker',
                    location: 'Flic en Flac, Mauritius',
                    isVerified: true
                },
                {
                    name: 'Raj Patel',
                    email: 'raj@example.com',
                    password: 'Test@123',
                    phone: '+230 5700 3333',
                    profilePhoto: 'https://i.pravatar.cc/150?img=12',
                    bio: 'Professional driver and local guide',
                    location: 'Port Louis, Mauritius',
                    isVerified: true
                }
            ];

            for (const userData of sampleUsers) {
                try {
                    await User.create(userData);
                } catch (e) {
                    // Skip if user already exists
                }
            }
            users = await User.find().limit(5);
        }
        console.log(`✅ Found ${users.length} users\n`);

        // Seed Drivers
        console.log('🚗 Seeding drivers...');
        const existingDrivers = await Driver.countDocuments();

        if (existingDrivers === 0) {
            const driverData = [
                {
                    userId: users[0]._id,
                    licenseNumber: 'MU-DL-001234',
                    licenseExpiry: new Date('2026-12-31'),
                    vehicleInfo: {
                        make: 'Toyota',
                        model: 'Camry',
                        year: 2022,
                        licensePlate: 'MU 1234',
                        color: 'Silver',
                        seats: 4
                    },
                    location: {
                        type: 'Point',
                        coordinates: [57.4979, -20.1609],
                        address: 'Port Louis, Mauritius'
                    },
                    services: ['personal_driver', 'airport_transfer', 'city_tour'],
                    pricing: {
                        baseRate: 500,
                        perKm: 25,
                        perHour: 800,
                        currency: 'MUR'
                    },
                    availability: {
                        isAvailable: true,
                        workingHours: { start: '06:00', end: '22:00' }
                    },
                    rating: 4.8,
                    reviewCount: 124,
                    totalRides: 456,
                    isVerified: true,
                    isActive: true
                },
                {
                    userId: users[1]._id,
                    licenseNumber: 'MU-DL-005678',
                    licenseExpiry: new Date('2027-06-15'),
                    vehicleInfo: {
                        make: 'Honda',
                        model: 'CR-V',
                        year: 2023,
                        licensePlate: 'MU 5678',
                        color: 'Black',
                        seats: 5
                    },
                    location: {
                        type: 'Point',
                        coordinates: [57.5703, -20.2989],
                        address: 'Flic en Flac, Mauritius'
                    },
                    services: ['personal_driver', 'long_distance', 'city_tour'],
                    pricing: {
                        baseRate: 600,
                        perKm: 30,
                        perHour: 1000,
                        currency: 'MUR'
                    },
                    availability: {
                        isAvailable: true,
                        workingHours: { start: '07:00', end: '20:00' }
                    },
                    rating: 4.9,
                    reviewCount: 89,
                    totalRides: 312,
                    isVerified: true,
                    isActive: true
                },
                {
                    userId: users[2]._id,
                    licenseNumber: 'MU-DL-009012',
                    licenseExpiry: new Date('2025-09-20'),
                    vehicleInfo: {
                        make: 'Mercedes',
                        model: 'E-Class',
                        year: 2021,
                        licensePlate: 'MU 9012',
                        color: 'White',
                        seats: 4
                    },
                    location: {
                        type: 'Point',
                        coordinates: [57.5522, -20.0107],
                        address: 'Grand Baie, Mauritius'
                    },
                    services: ['personal_driver', 'airport_transfer', 'long_distance'],
                    pricing: {
                        baseRate: 800,
                        perKm: 40,
                        perHour: 1500,
                        currency: 'MUR'
                    },
                    availability: {
                        isAvailable: true,
                        workingHours: { start: '08:00', end: '18:00' }
                    },
                    rating: 4.7,
                    reviewCount: 56,
                    totalRides: 198,
                    isVerified: true,
                    isActive: true
                }
            ];

            await Driver.insertMany(driverData);
            console.log(`✅ Created ${driverData.length} drivers\n`);
        } else {
            console.log(`ℹ️ Drivers already exist (${existingDrivers}), skipping...\n`);
        }

        // Seed Vehicles
        console.log('🚙 Seeding vehicles...');
        const existingVehicles = await Vehicle.countDocuments();

        if (existingVehicles === 0) {
            const vehicleData = [
                {
                    make: 'Toyota',
                    model: 'Corolla',
                    year: 2023,
                    type: 'car',
                    description: 'Reliable and fuel-efficient sedan, perfect for exploring Mauritius. Includes GPS and child seat on request.',
                    photos: [
                        'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800',
                        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'
                    ],
                    location: {
                        type: 'Point',
                        coordinates: [57.4979, -20.1609],
                        address: 'Port Louis, Mauritius'
                    },
                    ownerId: users[0]._id,
                    pricing: {
                        hourly: 300,
                        daily: 1800,
                        weekly: 10000,
                        monthly: 35000,
                        currency: 'MUR'
                    },
                    features: ['GPS', 'Automatic', 'AC', 'Bluetooth', 'USB Charging'],
                    specifications: {
                        seats: 5,
                        transmission: 'automatic',
                        fuelType: 'petrol',
                        engineSize: '1.8L'
                    },
                    availability: { isAvailable: true },
                    rating: 4.6,
                    reviewCount: 42,
                    isActive: true
                },
                {
                    make: 'Honda',
                    model: 'PCX 150',
                    year: 2023,
                    type: 'scooter',
                    description: 'Modern scooter ideal for beach hopping and coastal exploration. Helmet included.',
                    photos: [
                        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'
                    ],
                    location: {
                        type: 'Point',
                        coordinates: [57.5703, -20.2989],
                        address: 'Flic en Flac, Mauritius'
                    },
                    ownerId: users[1]._id,
                    pricing: {
                        hourly: 100,
                        daily: 500,
                        weekly: 2800,
                        monthly: 9000,
                        currency: 'MUR'
                    },
                    features: ['Helmet Included', 'Storage Box', 'USB Charging'],
                    specifications: {
                        seats: 2,
                        transmission: 'automatic',
                        fuelType: 'petrol',
                        engineSize: '150cc'
                    },
                    availability: { isAvailable: true },
                    rating: 4.8,
                    reviewCount: 78,
                    isActive: true
                },
                {
                    make: 'Giant',
                    model: 'Escape 3',
                    year: 2022,
                    type: 'bike',
                    description: 'Quality hybrid bike perfect for coastal paths and light trails. Lock and repair kit included.',
                    photos: [
                        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800'
                    ],
                    location: {
                        type: 'Point',
                        coordinates: [57.5522, -20.0107],
                        address: 'Grand Baie, Mauritius'
                    },
                    ownerId: users[2]._id,
                    pricing: {
                        hourly: 50,
                        daily: 250,
                        weekly: 1200,
                        monthly: 4000,
                        currency: 'MUR'
                    },
                    features: ['Lock Included', 'Repair Kit', 'Water Bottle Holder'],
                    specifications: {
                        seats: 1,
                        transmission: 'manual',
                        engineSize: '21-speed'
                    },
                    availability: { isAvailable: true },
                    rating: 4.5,
                    reviewCount: 34,
                    isActive: true
                },
                {
                    make: 'BMW',
                    model: 'X5',
                    year: 2022,
                    type: 'car',
                    description: 'Luxury SUV with premium features. Perfect for family trips or executive travel.',
                    photos: [
                        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
                    ],
                    location: {
                        type: 'Point',
                        coordinates: [57.4979, -20.1609],
                        address: 'Port Louis, Mauritius'
                    },
                    ownerId: users[0]._id,
                    pricing: {
                        hourly: 800,
                        daily: 5000,
                        weekly: 28000,
                        monthly: 90000,
                        currency: 'MUR'
                    },
                    features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Sound', 'AC', '4WD'],
                    specifications: {
                        seats: 7,
                        transmission: 'automatic',
                        fuelType: 'diesel',
                        engineSize: '3.0L'
                    },
                    availability: { isAvailable: true },
                    rating: 4.9,
                    reviewCount: 18,
                    isActive: true
                }
            ];

            await Vehicle.insertMany(vehicleData);
            console.log(`✅ Created ${vehicleData.length} vehicles\n`);
        } else {
            console.log(`ℹ️ Vehicles already exist (${existingVehicles}), skipping...\n`);
        }

        // Seed Posts
        console.log('📝 Seeding posts...');
        const existingPosts = await Post.countDocuments();

        if (existingPosts === 0) {
            // Get some activities for reference
            const activities = await Activity.find().limit(3);

            const postData = [
                {
                    userId: users[0]._id,
                    title: 'Amazing sunrise ride at Le Morne! 🌅',
                    content: 'Started the day with a beautiful 25km ride around Le Morne. The views were absolutely breathtaking. Highly recommend this route to all cycling enthusiasts!',
                    type: 'activity',
                    photos: [
                        'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
                        'https://images.unsplash.com/photo-1605639156481-d6cfbabaedaf?w=800'
                    ],
                    stats: {
                        distance: 25000,
                        time: 5400,
                        elevation: 320,
                        pace: 3.6,
                        calories: 680
                    },
                    activityId: activities[0]?._id,
                    visibility: 'public',
                    tags: ['cycling', 'sunrise', 'le-morne', 'mauritius'],
                    likesCount: 24,
                    commentsCount: 5
                },
                {
                    userId: users[1]._id,
                    title: 'Trail running at Black River Gorges 🏃‍♀️',
                    content: 'Conquered the challenging trails at Black River Gorges National Park today. 15km of pure adventure through the heart of Mauritius!',
                    type: 'activity',
                    photos: [
                        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
                    ],
                    stats: {
                        distance: 15000,
                        time: 7200,
                        elevation: 580,
                        pace: 8.0,
                        calories: 1200
                    },
                    visibility: 'public',
                    tags: ['trail-running', 'black-river', 'nature', 'adventure'],
                    likesCount: 45,
                    commentsCount: 12
                },
                {
                    userId: users[2]._id,
                    title: 'Beach yoga session at Belle Mare 🧘‍♂️',
                    content: 'Perfect morning for yoga on the beach. The sound of waves and the gentle breeze made for an incredible meditation experience.',
                    type: 'general',
                    photos: [
                        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
                    ],
                    visibility: 'public',
                    tags: ['yoga', 'beach', 'wellness', 'belle-mare'],
                    likesCount: 67,
                    commentsCount: 8
                },
                {
                    userId: users[0]._id,
                    title: '🏆 New Personal Best!',
                    content: 'Just completed my first century ride - 100km around the island! Couldn\'t have done it without the amazing Alonix community. Thanks for all the support!',
                    type: 'achievement',
                    photos: [
                        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800'
                    ],
                    stats: {
                        distance: 100000,
                        time: 18000,
                        elevation: 1200,
                        calories: 2800
                    },
                    visibility: 'public',
                    tags: ['century-ride', 'personal-best', 'cycling', 'milestone'],
                    likesCount: 156,
                    commentsCount: 32
                },
                {
                    userId: users[1]._id,
                    title: 'Hiking group photo at Pieter Both ⛰️',
                    content: 'Made it to the summit with an amazing group! The view from up here is simply incredible. Can\'t wait for the next adventure!',
                    type: 'photo',
                    photos: [
                        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
                        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'
                    ],
                    visibility: 'public',
                    tags: ['hiking', 'pieter-both', 'summit', 'group-photo'],
                    likesCount: 89,
                    commentsCount: 15
                }
            ];

            await Post.insertMany(postData);
            console.log(`✅ Created ${postData.length} posts\n`);
        } else {
            console.log(`ℹ️ Posts already exist (${existingPosts}), skipping...\n`);
        }

        // Summary
        console.log('─'.repeat(50));
        console.log('📊 SEED DATA SUMMARY');
        console.log('─'.repeat(50));
        console.log(`  Users: ${await User.countDocuments()}`);
        console.log(`  Drivers: ${await Driver.countDocuments()}`);
        console.log(`  Vehicles: ${await Vehicle.countDocuments()}`);
        console.log(`  Posts: ${await Post.countDocuments()}`);
        console.log(`  Activities: ${await Activity.countDocuments()}`);
        console.log('─'.repeat(50));

        console.log('\n🎉 Seeding completed successfully!');

        await mongoose.connection.close();
        console.log('🔒 Connection closed');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the seed
seedAllData();
