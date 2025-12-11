const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// @route   GET /api/hotels
// @desc    Get all hotels
// @access  Public
router.get('/', async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ rating: -1 });
        res.json({ success: true, count: hotels.length, data: hotels });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/hotels/near
// @desc    Find hotels inside a bounding box or near a center point
// @access  Public
router.get('/near', async (req, res) => {
    try {
        const { neLat, neLng, swLat, swLng, centerLat, centerLng, radius = 5000, limit = 100 } = req.query;

        const parsedLimit = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));

        const filter = {};

        if (neLat && neLng && swLat && swLng) {
            // Normalize values and create box: [ [minLng, minLat], [maxLng, maxLat] ]
            const nLat = parseFloat(neLat);
            const nLng = parseFloat(neLng);
            const sLat = parseFloat(swLat);
            const sLng = parseFloat(swLng);

            const minLat = Math.min(nLat, sLat);
            const maxLat = Math.max(nLat, sLat);
            const minLng = Math.min(nLng, sLng);
            const maxLng = Math.max(nLng, sLng);

            filter.location = {
                $geoWithin: {
                    $box: [ [minLng, minLat], [maxLng, maxLat] ]
                }
            };
        } else if (centerLat && centerLng) {
            // centerLat/centerLng provided: use $near with maxDistance in meters
            filter.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(centerLng), parseFloat(centerLat)] },
                    $maxDistance: Number(radius) || 5000
                }
            };
        } else {
            // No geo parameters provided: return bad request
            return res.status(400).json({ success: false, error: 'Provide either bbox (neLat,neLng,swLat,swLng) or centerLat/centerLng' });
        }

        // Project only needed fields; slice photos to 1 for thumbnails
        const projection = { name: 1, location: 1, photos: { $slice: 1 }, rating: 1, priceRange: 1 };

        const docs = await Hotel.find(filter, projection).lean().limit(parsedLimit);

        const data = docs.map(h => ({
            id: h._id,
            name: h.name,
            latitude: h.location?.coordinates?.[1] ?? null,
            longitude: h.location?.coordinates?.[0] ?? null,
            thumbnail: Array.isArray(h.photos) ? h.photos[0] : null,
            rating: h.rating,
            priceRange: h.priceRange
        }));

        return res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error('getNearby hotels error:', error);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/hotels/cluster
// @desc    Return clustered hotels for a viewport (simple grid clustering)
// @access  Public
router.get('/cluster', async (req, res) => {
    try {
        const { neLat, neLng, swLat, swLng, zoom = 10, limit = 100 } = req.query;

        if (!(neLat && neLng && swLat && swLng)) {
            return res.status(400).json({ success: false, error: 'Provide bbox: neLat, neLng, swLat, swLng' });
        }

        const nLat = parseFloat(neLat);
        const nLng = parseFloat(neLng);
        const sLat = parseFloat(swLat);
        const sLng = parseFloat(swLng);

        const minLat = Math.min(nLat, sLat);
        const maxLat = Math.max(nLat, sLat);
        const minLng = Math.min(nLng, sLng);
        const maxLng = Math.max(nLng, sLng);

        // Determine clustering precision from zoom (simple heuristic)
        const z = parseInt(zoom, 10) || 10;
        let precision = 2;
        if (z >= 13) precision = 4;
        else if (z >= 10) precision = 3;
        else if (z >= 7) precision = 2;
        else precision = 1;

        const projection = { name: 1, location: 1, photos: { $slice: 1 }, rating: 1, priceRange: 1 };

        const docs = await Hotel.find({
            location: {
                $geoWithin: {
                    $box: [ [minLng, minLat], [maxLng, maxLat] ]
                }
            }
        }, projection).lean().limit(Math.min(1000, parseInt(limit, 10) || 1000));

        // Group by rounded coordinates
        const groups = new Map();

        docs.forEach(h => {
            const lat = h.location?.coordinates?.[1];
            const lng = h.location?.coordinates?.[0];
            if (lat == null || lng == null) return;

            const latKey = Number(lat).toFixed(precision);
            const lngKey = Number(lng).toFixed(precision);
            const key = `${latKey}|${lngKey}`;

            if (!groups.has(key)) groups.set(key, { count: 0, latSum: 0, lngSum: 0, samples: [] });
            const g = groups.get(key);
            g.count += 1;
            g.latSum += lat;
            g.lngSum += lng;
            g.samples.push(h);
        });

        const clusters = [];
        groups.forEach((g, k) => {
            const avgLat = g.latSum / g.count;
            const avgLng = g.lngSum / g.count;
            // pick a sample item (first) for thumbnail/title
            const sample = g.samples[0];
            clusters.push({
                id: k,
                count: g.count,
                latitude: Number(avgLat.toFixed(6)),
                longitude: Number(avgLng.toFixed(6)),
                name: g.count === 1 ? sample.name : `${g.count} hotels`,
                thumbnail: Array.isArray(sample.photos) ? sample.photos[0] : null,
                rating: sample.rating,
                priceRange: sample.priceRange
            });
        });

        return res.json({ success: true, count: clusters.length, clusters });
    } catch (error) {
        console.error('hotel clustering error:', error);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/hotels/:id
// @desc    Get single hotel
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ success: false, error: 'Hotel not found' });
        }
        res.json({ success: true, data: hotel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
