/**
 * Google Maps Configuration
 * Full-scale integration with all Google Maps APIs
 */

export const GOOGLE_MAPS_CONFIG = {
    // Your API Key - FULL ACCESS
    API_KEY: 'AIzaSyCr5jmlN6OwUoySOgklEEitfTpCEQZT274',

    // Mauritius Region
    MAURITIUS: {
        center: {
            latitude: -20.1609,
            longitude: 57.5012,
        },
        bounds: {
            northeast: { lat: -19.9, lng: 57.8 },
            southwest: { lat: -20.5, lng: 57.3 },
        },
        zoom: {
            default: 11,
            city: 13,
            street: 16,
            building: 18,
        },
    },

    // API Endpoints
    ENDPOINTS: {
        // Places API
        AUTOCOMPLETE: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        PLACE_DETAILS: 'https://maps.googleapis.com/maps/api/place/details/json',
        NEARBY_SEARCH: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        TEXT_SEARCH: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
        FIND_PLACE: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',

        // Directions API
        DIRECTIONS: 'https://maps.googleapis.com/maps/api/directions/json',

        // Distance Matrix API
        DISTANCE_MATRIX: 'https://maps.googleapis.com/maps/api/distancematrix/json',

        // Geocoding API
        GEOCODE: 'https://maps.googleapis.com/maps/api/geocode/json',
        REVERSE_GEOCODE: 'https://maps.googleapis.com/maps/api/geocode/json',

        // Roads API
        SNAP_TO_ROADS: 'https://roads.googleapis.com/v1/snapToRoads',
        NEAREST_ROADS: 'https://roads.googleapis.com/v1/nearestRoads',

        // Static Maps API
        STATIC_MAP: 'https://maps.googleapis.com/maps/api/staticmap',
    },

    // Search Configuration
    SEARCH: {
        // Autocomplete settings
        autocomplete: {
            types: '(regions)', // or 'establishment', 'address', 'geocode'
            components: 'country:mu',
            radius: 50000, // 50km
            strictbounds: false,
            language: 'en',
        },

        // Place types for filtering
        placeTypes: {
            all: '',
            restaurant: 'restaurant',
            hotel: 'lodging',
            cafe: 'cafe',
            bar: 'bar',
            shopping: 'shopping_mall',
            park: 'park',
            beach: 'natural_feature',
            airport: 'airport',
            hospital: 'hospital',
            pharmacy: 'pharmacy',
            gas_station: 'gas_station',
            atm: 'atm',
            bank: 'bank',
        },
    },

    // Map Styling
    MAP_STYLES: {
        // Standard Google Maps style
        standard: [],

        // Dark mode
        dark: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }],
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }],
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }],
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }],
            },
        ],

        // Retro style
        retro: [
            { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
            {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#c9b2a6' }],
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#dcd2be' }],
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ae9e90' }],
            },
            {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{ color: '#dfd2ae' }],
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#dfd2ae' }],
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#93817c' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{ color: '#a5b076' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#447530' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#f5f1e6' }],
            },
            {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{ color: '#fdfcf8' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#f8c967' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#e9bc62' }],
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry',
                stylers: [{ color: '#e98d58' }],
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#db8555' }],
            },
            {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#806b63' }],
            },
            {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{ color: '#dfd2ae' }],
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#8f7d77' }],
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#ebe3cd' }],
            },
            {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{ color: '#dfd2ae' }],
            },
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{ color: '#b9d3c2' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#92998d' }],
            },
        ],
    },

    // Performance settings
    PERFORMANCE: {
        // Tile caching
        enableTileCache: true,
        maxCacheSize: 100, // MB

        // Marker clustering
        clusteringEnabled: true,
        clusterRadius: 50,
        minClusterSize: 2,

        // Debounce times
        searchDebounce: 300, // ms
        mapMoveDebounce: 500, // ms
    },
};

export default GOOGLE_MAPS_CONFIG;
