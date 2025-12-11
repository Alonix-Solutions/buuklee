// Mock data for Alonix prototype

export const currentUser = {
  id: 1,
  name: 'Sarah Thompson',
  email: 'sarah@example.com',
  phone: '+230 5XXX XXXX',
  profilePhoto: 'https://i.pravatar.cc/150?img=5',
  bio: 'Running enthusiast | Weekend warrior | Island explorer',
  location: 'Port Louis, Mauritius',
  stats: {
    challengesCompleted: 34,
    totalDistance: 3245,
    totalElevation: 28750,
    totalTime: 187 * 3600 + 23 * 60, // seconds
    memberSince: '2024-01-15',
    activeDays: 156
  },
  achievements: [
    {
      id: 1,
      name: 'Island Circumnavigator',
      icon: '🏆',
      description: 'Completed 225km cycling challenge around Mauritius',
      unlockedAt: '2025-12-15'
    },
    {
      id: 2,
      name: 'Mountain Conqueror',
      icon: '🏔️',
      description: 'Summited Le Morne Brabant',
      unlockedAt: '2025-11-20'
    },
    {
      id: 3,
      name: 'Early Bird',
      icon: '🌅',
      description: 'Completed 10 sunrise activities',
      unlockedAt: '2025-10-05'
    },
    {
      id: 4,
      name: 'Century Rider',
      icon: '🎯',
      description: 'Completed a 100km+ ride',
      unlockedAt: '2025-09-12'
    }
  ]
};

export const challenges = [
  {
    id: 1,
    title: 'Mauritius 360° - Coastal Circuit',
    description: 'Epic one-day cycling adventure around the entire island!',
    type: 'group',
    activity: 'cycling',
    difficulty: 'hard',
    distance: 225,
    elevation: 2400,
    date: '2025-12-15T05:00:00',
    maxParticipants: 20,
    currentParticipants: 15,
    meetingPoint: {
      latitude: -20.0092,
      longitude: 57.5761,
      address: 'Grand Baie Beach, Mauritius'
    },
    coverPhoto: 'https://picsum.photos/seed/cycling1/800/400',
    organizer: {
      id: 2,
      name: 'Alice Martinez',
      photo: 'https://i.pravatar.cc/150?img=1',
      rating: 4.9
    },
    rideSharingAvailable: true,
    availableSeats: 3,
    status: 'upcoming'
  },
  {
    id: 2,
    title: 'Le Morne Sunrise Hike',
    description: 'Watch the sunrise from the top of Le Morne Brabant',
    type: 'group',
    activity: 'hiking',
    difficulty: 'medium',
    distance: 7.8,
    elevation: 556,
    date: '2025-11-18T05:30:00',
    maxParticipants: 15,
    currentParticipants: 12,
    meetingPoint: {
      latitude: -20.4552,
      longitude: 57.3218,
      address: 'Le Morne Public Beach Parking'
    },
    coverPhoto: 'https://picsum.photos/seed/hiking1/800/400',
    organizer: {
      id: 3,
      name: 'Bob Chen',
      photo: 'https://i.pravatar.cc/150?img=12',
      rating: 4.7
    },
    rideSharingAvailable: true,
    availableSeats: 2,
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Black River Gorges Trail Run',
    description: 'Technical trail run through beautiful rainforest',
    type: 'competitive',
    activity: 'running',
    difficulty: 'hard',
    distance: 21,
    elevation: 890,
    date: '2025-11-25T06:00:00',
    maxParticipants: 30,
    currentParticipants: 18,
    meetingPoint: {
      latitude: -20.4167,
      longitude: 57.4333,
      address: 'Black River Gorges Visitor Center'
    },
    coverPhoto: 'https://picsum.photos/seed/running1/800/400',
    organizer: {
      id: 4,
      name: 'Mike Johnson',
      photo: 'https://i.pravatar.cc/150?img=8',
      rating: 4.8
    },
    rideSharingAvailable: false,
    status: 'upcoming'
  },
  {
    id: 4,
    title: 'Weekend Park Run',
    description: 'Casual 5k run for all fitness levels',
    type: 'club',
    activity: 'running',
    difficulty: 'easy',
    distance: 5,
    elevation: 45,
    date: '2025-11-16T06:00:00',
    maxParticipants: null,
    currentParticipants: 23,
    meetingPoint: {
      latitude: -20.1644,
      longitude: 57.5046,
      address: 'Sir Seewoosagur Ramgoolam Botanical Garden'
    },
    coverPhoto: 'https://picsum.photos/seed/running2/800/400',
    organizer: {
      id: 5,
      name: 'Lisa Park',
      photo: 'https://i.pravatar.cc/150?img=9',
      rating: 5.0
    },
    rideSharingAvailable: false,
    status: 'upcoming'
  }
];

export const clubs = [
  {
    id: 1,
    name: 'Port Louis Runners',
    type: 'running',
    description: 'Weekly runs for all fitness levels. Join us every Tuesday and Saturday!',
    logo: 'https://picsum.photos/seed/club1/200/200',
    coverPhoto: 'https://picsum.photos/seed/club1cover/800/300',
    members: 156,
    location: 'Port Louis',
    membershipType: 'open',
    nextEvent: {
      date: '2025-11-16T06:00:00',
      title: 'Saturday Morning 10k'
    }
  },
  {
    id: 2,
    name: 'Coastal Cyclists',
    type: 'cycling',
    description: 'Exploring Mauritius one pedal stroke at a time',
    logo: 'https://picsum.photos/seed/club2/200/200',
    coverPhoto: 'https://picsum.photos/seed/club2cover/800/300',
    members: 89,
    location: 'Grand Baie',
    membershipType: 'open',
    nextEvent: {
      date: '2025-11-17T05:30:00',
      title: 'Sunday Coastal Ride'
    }
  },
  {
    id: 3,
    name: 'Weekend Warriors',
    type: 'multi-sport',
    description: 'Friendly group for running, cycling, and hiking',
    logo: 'https://picsum.photos/seed/club3/200/200',
    coverPhoto: 'https://picsum.photos/seed/club3cover/800/300',
    members: 234,
    location: 'Curepipe',
    membershipType: 'open',
    nextEvent: {
      date: '2025-11-16T06:30:00',
      title: 'Trail Run in Tamarind Falls'
    }
  }
];

export const hotels = [
  {
    id: 1,
    name: 'Paradise Beach Hotel',
    rating: 4.5,
    reviewCount: 234,
    price: 95,
    currency: 'USD',
    priceRange: '$$',
    location: {
      latitude: -20.3484,
      longitude: 57.3606,
      address: 'Flic en Flac Beach Road'
    },
    distance: 0.4, // km from beach
    photos: [
      'https://picsum.photos/seed/hotel1-1/800/600',
      'https://picsum.photos/seed/hotel1-2/800/600',
      'https://picsum.photos/seed/hotel1-3/800/600'
    ],
    amenities: ['Pool', 'WiFi', 'Restaurant', 'Beach Access', 'Parking'],
    description: 'Beachfront paradise with stunning ocean views'
  },
  {
    id: 2,
    name: 'Grand Baie Suites',
    rating: 4.7,
    reviewCount: 189,
    price: 125,
    currency: 'USD',
    priceRange: '$$$',
    location: {
      latitude: -20.0092,
      longitude: 57.5761,
      address: 'Coastal Road, Grand Baie'
    },
    distance: 0.2,
    photos: [
      'https://picsum.photos/seed/hotel2-1/800/600',
      'https://picsum.photos/seed/hotel2-2/800/600'
    ],
    amenities: ['Pool', 'WiFi', 'Spa', 'Restaurant', 'Bar', 'Gym'],
    description: 'Luxury suites in the heart of Grand Baie'
  },
  {
    id: 3,
    name: 'Le Morne Resort',
    rating: 4.8,
    reviewCount: 312,
    price: 180,
    currency: 'USD',
    priceRange: '$$$',
    location: {
      latitude: -20.4552,
      longitude: 57.3218,
      address: 'Le Morne Peninsula'
    },
    distance: 0.1,
    photos: [
      'https://picsum.photos/seed/hotel3-1/800/600',
      'https://picsum.photos/seed/hotel3-2/800/600',
      'https://picsum.photos/seed/hotel3-3/800/600'
    ],
    amenities: ['Pool', 'WiFi', 'Spa', 'Restaurant', 'Water Sports', 'Beach'],
    description: 'Luxury resort with breathtaking mountain views'
  }
];

export const restaurants = [
  {
    id: 1,
    name: 'Le Pescatore',
    cuisine: 'Seafood',
    rating: 4.8,
    reviewCount: 445,
    priceRange: '$$$',
    location: {
      latitude: -20.0344,
      longitude: 57.5489,
      address: 'Coastal Road, Trou aux Biches'
    },
    photos: [
      'https://picsum.photos/seed/restaurant1-1/800/600',
      'https://picsum.photos/seed/restaurant1-2/800/600'
    ],
    openingHours: '11:00 AM - 10:00 PM',
    specialties: ['Fresh Lobster', 'Grilled Fish', 'Seafood Platter']
  },
  {
    id: 2,
    name: 'Chez Tante Athalie',
    cuisine: 'Mauritian',
    rating: 4.6,
    reviewCount: 267,
    priceRange: '$$',
    location: {
      latitude: -20.1637,
      longitude: 57.5074,
      address: 'Port Louis Waterfront'
    },
    photos: [
      'https://picsum.photos/seed/restaurant2-1/800/600'
    ],
    openingHours: '12:00 PM - 9:00 PM',
    specialties: ['Curry', 'Rougaille', 'Biryani']
  }
];

export const rideShares = [
  {
    id: 1,
    challengeId: 1,
    driver: {
      id: 2,
      name: 'Alice Martinez',
      photo: 'https://i.pravatar.cc/150?img=1',
      rating: 4.9,
      totalRides: 45
    },
    from: {
      latitude: -20.1644,
      longitude: 57.5046,
      address: 'Port Louis, Caudan Waterfront'
    },
    to: {
      latitude: -20.0092,
      longitude: 57.5761,
      address: 'Grand Baie Beach'
    },
    departureTime: '2025-12-15T04:00:00',
    availableSeats: 3,
    totalSeats: 3,
    costPerPerson: 500,
    currency: 'MUR',
    canCarryBikes: true,
    bikeCapacity: 2,
    carDetails: {
      make: 'Toyota RAV4',
      color: 'Silver'
    },
    returnTripAvailable: true,
    passengers: [
      {
        id: 101,
        name: 'Bob Chen',
        photo: 'https://i.pravatar.cc/150?img=12',
        status: 'confirmed'
      }
    ]
  },
  {
    id: 2,
    challengeId: 2,
    driver: {
      id: 3,
      name: 'Bob Chen',
      photo: 'https://i.pravatar.cc/150?img=12',
      rating: 4.7,
      totalRides: 23
    },
    from: {
      latitude: -20.1644,
      longitude: 57.5046,
      address: 'Port Louis'
    },
    to: {
      latitude: -20.4552,
      longitude: 57.3218,
      address: 'Le Morne Public Beach Parking'
    },
    departureTime: '2025-11-18T04:30:00',
    availableSeats: 2,
    totalSeats: 3,
    costPerPerson: 600,
    currency: 'MUR',
    canCarryBikes: false,
    carDetails: {
      make: 'Honda CR-V',
      color: 'Black'
    },
    returnTripAvailable: true,
    passengers: [
      {
        id: 102,
        name: 'Diana Lee',
        photo: 'https://i.pravatar.cc/150?img=9',
        status: 'confirmed'
      }
    ]
  }
];

export const posts = [
  {
    id: 1,
    user: {
      id: 2,
      name: 'Alice Martinez',
      photo: 'https://i.pravatar.cc/150?img=1'
    },
    type: 'challenge_completion',
    challengeId: 1,
    title: 'Conquered Mauritius 360° - 225km around paradise!',
    content: 'Incredible day cycling around the island with 15 amazing people! Started at 5 AM from Grand Baie, finished at 4 PM. The views were breathtaking, especially the coastal roads. Legs are dead but heart is full!',
    photos: [
      'https://picsum.photos/seed/post1-1/800/600',
      'https://picsum.photos/seed/post1-2/800/600',
      'https://picsum.photos/seed/post1-3/800/600'
    ],
    stats: {
      distance: 225.3,
      time: 31643, // seconds
      elevation: 2384,
      avgSpeed: 25.6,
      maxSpeed: 64.2,
      calories: 4956
    },
    achievement: {
      name: 'Island Circumnavigator',
      icon: '🏆'
    },
    likes: 156,
    comments: 23,
    createdAt: '2025-12-15T16:30:00',
    visibility: 'public'
  },
  {
    id: 2,
    user: {
      id: 3,
      name: 'Bob Chen',
      photo: 'https://i.pravatar.cc/150?img=12'
    },
    type: 'challenge_completion',
    challengeId: 2,
    title: 'Le Morne summit at sunrise - worth every step!',
    content: 'What an incredible experience! The sunrise from the top was absolutely magical. Tough climb but amazing group energy.',
    photos: [
      'https://picsum.photos/seed/post2-1/800/600',
      'https://picsum.photos/seed/post2-2/800/600'
    ],
    stats: {
      distance: 7.8,
      time: 12934,
      elevation: 556,
      avgSpeed: 3.2,
      calories: 892
    },
    achievement: {
      name: 'Mountain Conqueror',
      icon: '🏔️'
    },
    likes: 89,
    comments: 12,
    createdAt: '2025-11-20T08:15:00',
    visibility: 'public'
  },
  {
    id: 3,
    user: {
      id: 4,
      name: 'Mike Johnson',
      photo: 'https://i.pravatar.cc/150?img=8'
    },
    type: 'achievement',
    title: 'New personal best! 10k in under 45 mins',
    content: 'Finally broke my 45-minute barrier for 10k! All those early morning runs paying off. Next goal: sub-40!',
    photos: [
      'https://picsum.photos/seed/post3-1/800/600'
    ],
    stats: {
      distance: 10,
      time: 2687,
      avgSpeed: 13.4,
      calories: 645
    },
    likes: 67,
    comments: 8,
    createdAt: '2025-11-14T07:30:00',
    visibility: 'public'
  }
];

export const liveTracking = {
  sessionId: 'session_12345',
  challengeId: 2,
  participants: [
    {
      userId: 1,
      name: 'Sarah Thompson',
      photo: 'https://i.pravatar.cc/150?img=5',
      currentLocation: {
        latitude: -20.4425,
        longitude: 57.3205,
        altitude: 345
      },
      stats: {
        distance: 5.2,
        time: 6323,
        elevation: 485,
        pace: 754, // seconds per km
        heartRate: 156
      },
      rank: 3
    },
    {
      userId: 6,
      name: 'Chris Taylor',
      photo: 'https://i.pravatar.cc/150?img=13',
      currentLocation: {
        latitude: -20.4398,
        longitude: 57.3212,
        altitude: 412
      },
      stats: {
        distance: 6.8,
        time: 7856,
        elevation: 542,
        pace: 692,
        heartRate: 168
      },
      rank: 2
    },
    {
      userId: 4,
      name: 'Mike Johnson',
      photo: 'https://i.pravatar.cc/150?img=8',
      currentLocation: {
        latitude: -20.4356,
        longitude: 57.3225,
        altitude: 556
      },
      stats: {
        distance: 7.8,
        time: 8654,
        elevation: 556,
        pace: 665,
        heartRate: 172
      },
      rank: 1
    }
  ]
};

export const sharedTaxiRequests = [
  {
    id: 1,
    from: {
      latitude: -20.1644,
      longitude: 57.5046,
      address: 'Port Louis'
    },
    to: {
      latitude: -20.3484,
      longitude: 57.3606,
      address: 'Flic en Flac Beach'
    },
    requestTime: '2025-11-15T10:00:00',
    passengers: [
      {
        id: 1,
        name: 'Sarah Thompson',
        photo: 'https://i.pravatar.cc/150?img=5',
        cost: 400
      },
      {
        id: 7,
        name: 'Mike Davis',
        photo: 'https://i.pravatar.cc/150?img=11',
        cost: 375
      },
      {
        id: 8,
        name: 'Lisa Brown',
        photo: 'https://i.pravatar.cc/150?img=10',
        cost: 375
      }
    ],
    driver: {
      id: 100,
      name: 'Hassan Ahmed',
      photo: 'https://i.pravatar.cc/150?img=14',
      rating: 4.8,
      car: 'Toyota Corolla',
      plate: 'AG 1234',
      currentLocation: {
        latitude: -20.1580,
        longitude: 57.5012
      }
    },
    totalCost: 1150,
    individualSavings: 57,
    status: 'en_route',
    eta: 4
  }
];

// Car Rentals
export const cars = [
  {
    id: 1,
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    car_type: 'sedan',
    mileage: 15000,
    price: 45,
    description: 'Comfortable and fuel-efficient sedan perfect for city driving and island tours',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31dfaa49?w=800',
    features: ['Automatic', 'AC', 'GPS', 'Bluetooth'],
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    rating: 4.8,
    reviewCount: 124,
    available: true,
    listings: [
      { period: 'hourly', price: 15 },
      { period: 'daily', price: 45 },
      { period: 'weekly', price: 280 }
    ]
  },
  {
    id: 2,
    make: 'Honda',
    model: 'CR-V',
    year: 2024,
    car_type: 'suv',
    mileage: 8000,
    price: 75,
    description: 'Spacious SUV ideal for families and adventure seekers',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    features: ['Automatic', 'AC', 'GPS', '4WD', 'Roof Rack'],
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    rating: 4.9,
    reviewCount: 89,
    available: true,
    listings: [
      { period: 'hourly', price: 25 },
      { period: 'daily', price: 75 },
      { period: 'weekly', price: 490 }
    ]
  },
  {
    id: 3,
    make: 'Suzuki',
    model: 'Swift',
    year: 2023,
    car_type: 'coupe',
    mileage: 12000,
    price: 35,
    description: 'Compact and agile, perfect for navigating narrow coastal roads',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    features: ['Manual', 'AC', 'Bluetooth'],
    seats: 4,
    transmission: 'Manual',
    fuelType: 'Petrol',
    rating: 4.6,
    reviewCount: 156,
    available: true,
    listings: [
      { period: 'hourly', price: 12 },
      { period: 'daily', price: 35 },
      { period: 'weekly', price: 220 }
    ]
  },
  {
    id: 4,
    make: 'Nissan',
    model: 'X-Trail',
    year: 2024,
    car_type: 'suv',
    mileage: 5000,
    price: 80,
    description: 'Premium SUV with all the bells and whistles for luxury travel',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    features: ['Automatic', 'AC', 'GPS', 'Leather Seats', 'Sunroof'],
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    rating: 4.9,
    reviewCount: 67,
    available: true,
    listings: [
      { period: 'hourly', price: 28 },
      { period: 'daily', price: 80 },
      { period: 'weekly', price: 530 }
    ]
  },
  {
    id: 5,
    make: 'Hyundai',
    model: 'i20',
    year: 2023,
    car_type: 'sedan',
    mileage: 18000,
    price: 40,
    description: 'Reliable and economical choice for budget-conscious travelers',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    features: ['Automatic', 'AC', 'USB Charging'],
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    rating: 4.7,
    reviewCount: 203,
    available: true,
    listings: [
      { period: 'hourly', price: 13 },
      { period: 'daily', price: 40 },
      { period: 'weekly', price: 260 }
    ]
  },
  {
    id: 6,
    make: 'Ford',
    model: 'Ranger',
    year: 2024,
    car_type: 'truck',
    mileage: 10000,
    price: 95,
    description: 'Powerful pickup truck for off-road adventures and heavy cargo',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    features: ['Automatic', '4WD', 'Tow Package', 'Bed Liner'],
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    rating: 4.8,
    reviewCount: 45,
    available: false,
    listings: [
      { period: 'hourly', price: 32 },
      { period: 'daily', price: 95 },
      { period: 'weekly', price: 630 }
    ]
  }
];

// Drivers data
export const drivers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    phone: '+230 5234 5678',
    email: 'rajesh.kumar@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4.9,
    reviewCount: 342,
    vehicle: {
      make: 'Toyota',
      model: 'Prius',
      year: 2022,
      color: 'Silver',
      plateNumber: 'MU 1234',
      type: 'sedan'
    },
    experience_years: 8,
    languages: ['English', 'French', 'Hindi', 'Creole'],
    services: ['Airport Transfer', 'City Tours', 'Island Tours'],
    available: true,
    location: {
      latitude: -20.1609,
      longitude: 57.5012,
      address: 'Port Louis, Mauritius'
    },
    pricePerHour: 25,
    pricePerDay: 180,
    verified: true,
    totalTrips: 1250
  },
  {
    id: 2,
    name: 'Jean-Pierre Dubois',
    phone: '+230 5345 6789',
    email: 'jp.dubois@example.com',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 4.8,
    reviewCount: 289,
    vehicle: {
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      color: 'Black',
      plateNumber: 'MU 5678',
      type: 'sedan'
    },
    experience_years: 12,
    languages: ['French', 'English', 'Creole'],
    services: ['Airport Transfer', 'Business Travel', 'City Tours'],
    available: true,
    location: {
      latitude: -20.1689,
      longitude: 57.5089,
      address: 'Caudan, Port Louis'
    },
    pricePerHour: 28,
    pricePerDay: 200,
    verified: true,
    totalTrips: 1580
  },
  {
    id: 3,
    name: 'Alain Chen',
    phone: '+230 5456 7890',
    email: 'alain.chen@example.com',
    avatar: 'https://i.pravatar.cc/150?img=51',
    rating: 4.7,
    reviewCount: 198,
    vehicle: {
      make: 'Nissan',
      model: 'X-Trail',
      year: 2023,
      color: 'White',
      plateNumber: 'MU 9012',
      type: 'suv'
    },
    experience_years: 6,
    languages: ['English', 'Mandarin', 'French', 'Creole'],
    services: ['Island Tours', 'Mountain Hiking', 'Beach Tours'],
    available: true,
    location: {
      latitude: -20.1745,
      longitude: 57.5125,
      address: 'Grand Bay, Mauritius'
    },
    pricePerHour: 30,
    pricePerDay: 220,
    verified: true,
    totalTrips: 856
  },
  {
    id: 4,
    name: 'Marie Laurent',
    phone: '+230 5567 8901',
    email: 'marie.laurent@example.com',
    avatar: 'https://i.pravatar.cc/150?img=45',
    rating: 4.9,
    reviewCount: 412,
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Blue',
      plateNumber: 'MU 3456',
      type: 'sedan'
    },
    experience_years: 10,
    languages: ['French', 'English', 'Creole'],
    services: ['Airport Transfer', 'Wedding Events', 'City Tours'],
    available: false,
    location: {
      latitude: -20.1856,
      longitude: 57.5234,
      address: 'Flic en Flac, Mauritius'
    },
    pricePerHour: 27,
    pricePerDay: 190,
    verified: true,
    totalTrips: 1920
  },
  {
    id: 5,
    name: 'David Ramgoolam',
    phone: '+230 5678 9012',
    email: 'david.ram@example.com',
    avatar: 'https://i.pravatar.cc/150?img=68',
    rating: 4.6,
    reviewCount: 156,
    vehicle: {
      make: 'Hyundai',
      model: 'Tucson',
      year: 2021,
      color: 'Gray',
      plateNumber: 'MU 7890',
      type: 'suv'
    },
    experience_years: 5,
    languages: ['English', 'Hindi', 'Creole'],
    services: ['City Tours', 'Shopping Tours', 'Restaurant Tours'],
    available: true,
    location: {
      latitude: -20.1567,
      longitude: 57.4989,
      address: 'Quatre Bornes, Mauritius'
    },
    pricePerHour: 24,
    pricePerDay: 175,
    verified: true,
    totalTrips: 645
  }
];
