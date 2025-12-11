const mauritiusData = {
    activities: [
        {
            title: 'Le Morne Brabant Hike',
            description: 'Iconic UNESCO World Heritage site offering stunning 360-degree views of the coastline and the famous underwater waterfall illusion. A challenging but rewarding climb.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.3205, -20.4425],
                address: 'Le Morne Trailhead, Le Morne Village'
            },
            activityType: 'hiking',
            difficulty: 'hard',
            maxParticipants: 15,
            photos: ['https://images.unsplash.com/photo-1542259659439-4291865a1965?q=80&w=1000&auto=format&fit=crop']
        },
        {
            title: 'Black River Peak (Piton de la Petite Rivière Noire)',
            description: 'Hike to the highest point in Mauritius (828m). A scenic trail through the Black River Gorges National Park with panoramic island views.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.4000, -20.4167],
                address: 'Black River Gorges Viewpoint'
            },
            activityType: 'hiking',
            difficulty: 'medium',
            maxParticipants: 20,
            photos: ['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop']
        },
        {
            title: 'Le Pouce Mountain Hike',
            description: 'The "Thumb" mountain offers one of the best views of Port Louis and the Moka Range. A moderate hike suitable for most fitness levels.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.5333, -20.1980],
                address: 'Petit Verger, Saint Pierre'
            },
            activityType: 'hiking',
            difficulty: 'medium',
            maxParticipants: 25,
            photos: ['https://images.unsplash.com/photo-1589405858862-2ac9cbb41321?q=80&w=1000&auto=format&fit=crop']
        },
        {
            title: 'Tamarind Falls (7 Cascades) Adventure',
            description: 'Explore a series of 7 stunning waterfalls in a lush canyon. Opportunities for swimming in natural pools. Guide recommended.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.4667, -20.3500],
                address: 'Henrietta Bus Terminal'
            },
            activityType: 'hiking',
            difficulty: 'hard',
            maxParticipants: 12,
            photos: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1000&auto=format&fit=crop']
        },
        {
            title: 'Pieter Both Challenge',
            description: 'The second highest mountain in Mauritius, famous for the boulder balanced on its peak. A technical climb requiring equipment for the summit.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.5564, -20.1933],
                address: 'La Laura Village'
            },
            activityType: 'hiking',
            difficulty: 'extreme',
            maxParticipants: 8,
            photos: ['https://images.unsplash.com/photo-1544985338-3486a4279b94?q=80&w=1000&auto=format&fit=crop']
        },
        {
            title: 'Sunset Yoga at Flic en Flac',
            description: 'Relaxing yoga session by the beach as the sun sets over the Indian Ocean. Open to all levels.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.3667, -20.2667],
                address: 'Flic en Flac Public Beach'
            },
            activityType: 'other',
            difficulty: 'easy',
            maxParticipants: 30,
            photos: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop']
        },
        {
            title: 'Coastal Cycling: North Coast',
            description: 'A scenic ride from Grand Baie to Cap Malheureux, passing by beautiful beaches and the famous red-roofed church.',
            meetingPoint: {
                type: 'Point',
                coordinates: [57.5833, -20.0167],
                address: 'Grand Baie Public Beach'
            },
            activityType: 'cycling',
            difficulty: 'medium',
            maxParticipants: 15,
            photos: ['https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1000&auto=format&fit=crop']
        }
    ],
    hotels: [
        {
            name: 'One&Only Le Saint Géran',
            description: 'Iconic luxury resort on a private peninsula, offering a blend of privacy and natural beauty between a calm lagoon and the Indian Ocean.',
            location: {
                type: 'Point',
                coordinates: [57.7167, -20.1667],
                address: 'Pointe de Flacq',
                city: 'Poste de Flacq',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['Private Pool', 'Spa', 'Golf', 'Kids Club', 'Water Sports'],
            rating: 4.9,
            priceRange: { min: 35000, max: 150000, currency: 'MUR' },
            whatsappNumber: '+23055550001',
            contactEmail: 'reservations@oneandonly.mu',
            website: 'https://www.oneandonlyresorts.com'
        },
        {
            name: 'Four Seasons Resort Mauritius at Anahita',
            description: 'Secluded luxury with private villas, each featuring a pool and garden. Offers access to two championship golf courses.',
            location: {
                type: 'Point',
                coordinates: [57.7833, -20.2667],
                address: 'Beau Champ',
                city: 'Trou d\'Eau Douce',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['Private Villas', 'Golf', 'Spa', 'Private Beach'],
            rating: 4.9,
            priceRange: { min: 40000, max: 200000, currency: 'MUR' },
            whatsappNumber: '+23055550002',
            contactEmail: 'reservations.mas@fourseasons.com',
            website: 'https://www.fourseasons.com/mauritius'
        },
        {
            name: 'LUX* Grand Baie',
            description: 'A modern, chic resort on the north coast, known for its rooftop bar, vibrant atmosphere, and world-class design.',
            location: {
                type: 'Point',
                coordinates: [57.5833, -20.0167],
                address: 'Coastal Road',
                city: 'Grand Baie',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['Rooftop Pool', 'Spa', 'Fitness Centre', 'Nightclub'],
            rating: 4.8,
            priceRange: { min: 25000, max: 80000, currency: 'MUR' },
            whatsappNumber: '+23055550003',
            contactEmail: 'reservation@luxgrandbaie.com',
            website: 'https://www.luxresorts.com'
        },
        {
            name: 'The Oberoi Beach Resort',
            description: 'Located in Turtle Bay, this resort features a swimming pool, spa & wellness centre, and fitness centre.',
            location: {
                type: 'Point',
                coordinates: [57.5167, -20.0833],
                address: 'Turtle Bay',
                city: 'Pointe aux Piments',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['WiFi', 'Pool', 'Spa', 'Tennis Court'],
            rating: 4.9,
            priceRange: { min: 20000, max: 60000, currency: 'MUR' },
            whatsappNumber: '+23055555678',
            contactEmail: 'reservations@oberoi-mauritius.com',
            website: 'https://www.oberoihotels.com'
        },
        {
            name: 'LUX* Le Morne',
            description: 'Sheltered by Le Morne Brabant, this luxury resort offers 5 swimming pools, a spa, and 3 restaurants.',
            location: {
                type: 'Point',
                coordinates: [57.3167, -20.4500],
                address: 'Le Morne Peninsula',
                city: 'Le Morne',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Beach Access'],
            rating: 4.8,
            priceRange: { min: 15000, max: 50000, currency: 'MUR' },
            whatsappNumber: '+23055551234',
            contactEmail: 'reservations@luxlemorne.com',
            website: 'https://www.luxresorts.com'
        },
        {
            name: 'Constance Belle Mare Plage',
            description: 'Set along a 2km white sand beach, featuring two 18-hole championship golf courses.',
            location: {
                type: 'Point',
                coordinates: [57.7667, -20.1833],
                address: 'Belle Mare Plage',
                city: 'Belle Mare',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['Golf', 'Spa', 'Kids Club', 'Dive Center'],
            rating: 4.7,
            priceRange: { min: 18000, max: 60000, currency: 'MUR' },
            whatsappNumber: '+23055550004',
            contactEmail: 'res@constancehotels.com',
            website: 'https://www.constancehotels.com'
        },
        {
            name: 'Maradiva Villas Resort & Spa',
            description: 'All-villa resort with private pools, focusing on Ayurveda and wellness.',
            location: {
                type: 'Point',
                coordinates: [57.3667, -20.2833],
                address: 'Wolmar',
                city: 'Flic en Flac',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop'],
            amenities: ['Private Pool', 'Ayurveda Spa', 'Beachfront'],
            rating: 4.6,
            priceRange: { min: 30000, max: 90000, currency: 'MUR' },
            whatsappNumber: '+23055550005',
            contactEmail: 'reservation@maradiva.com',
            website: 'https://www.maradiva.com'
        }
    ],
    restaurants: [
        {
            name: 'Le Chamarel Restaurant',
            description: 'Famous for its panoramic views of the west coast and delicious local Creole cuisine.',
            cuisine: ['Creole', 'Local', 'International'],
            location: {
                type: 'Point',
                coordinates: [57.3944, -20.4261],
                address: 'La Crête, Chamarel',
                city: 'Chamarel',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop'],
            rating: 4.6,
            priceRange: '$$$',
            whatsappNumber: '+23055559012',
            contactEmail: 'info@lechamarel.com',
            website: 'https://www.lechamarelrestaurant.com'
        },
        {
            name: 'Escale Creole',
            description: 'Authentic Mauritian Creole cuisine served in a warm, garden setting. A true taste of home.',
            cuisine: ['Creole', 'Local'],
            location: {
                type: 'Point',
                coordinates: [57.5012, -20.2012],
                address: 'Bois Cheri Road',
                city: 'Moka',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop'],
            rating: 4.8,
            priceRange: '$$',
            whatsappNumber: '+23055553456',
            contactEmail: 'contact@escalecreole.net',
            website: 'https://www.escalecreole.net'
        },
        {
            name: 'Le Capitaine',
            description: 'Renowned seafood restaurant in Grand Baie, situated right on the water\'s edge.',
            cuisine: ['Seafood', 'International'],
            location: {
                type: 'Point',
                coordinates: [57.5833, -20.0167],
                address: 'Royal Road',
                city: 'Grand Baie',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=1000&auto=format&fit=crop'],
            rating: 4.5,
            priceRange: '$$$',
            whatsappNumber: '+23055550010',
            contactEmail: 'info@lecapitaine.mu',
            website: 'https://www.lecapitaine.mu'
        },
        {
            name: 'Domaine Anna',
            description: 'Elegant dining amidst sugar cane fields and lakes, specializing in Chinese and seafood dishes.',
            cuisine: ['Chinese', 'Seafood', 'Fusion'],
            location: {
                type: 'Point',
                coordinates: [57.3833, -20.2667],
                address: 'Medine',
                city: 'Flic en Flac',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop'],
            rating: 4.4,
            priceRange: '$$$',
            whatsappNumber: '+23055550011',
            contactEmail: 'contact@domaineanna.net',
            website: 'https://www.domaineanna.net'
        },
        {
            name: 'Happy Rajah',
            description: 'Popular Indian restaurant offering authentic curries and tandoori dishes in a cozy atmosphere.',
            cuisine: ['Indian'],
            location: {
                type: 'Point',
                coordinates: [57.5833, -20.0167],
                address: 'Super U Complex',
                city: 'Grand Baie',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop'],
            rating: 4.3,
            priceRange: '$$',
            whatsappNumber: '+23055550012',
            contactEmail: 'info@happyrajah.com',
            website: 'https://www.happyrajah.com'
        },
        {
            name: 'La Bonne Marmite',
            description: 'A favorite for local Mauritian dishes in the heart of Port Louis.',
            cuisine: ['Mauritian', 'Creole', 'Indian'],
            location: {
                type: 'Point',
                coordinates: [57.5000, -20.1609],
                address: 'Sir William Newton St',
                city: 'Port Louis',
                country: 'Mauritius'
            },
            photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop'],
            rating: 4.2,
            priceRange: '$',
            whatsappNumber: '+23055550013',
            contactEmail: 'info@labonnemarmite.com',
            website: 'https://www.labonnemarmite.com'
        }
    ]
};

module.exports = mauritiusData;
