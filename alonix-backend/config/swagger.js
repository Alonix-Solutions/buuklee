const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Alonix Backend API',
            version: '1.0.0',
            description: 'API documentation for Alonix Backend',
            contact: {
                name: 'Alonix Support',
                email: 'support@alonix.com',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? (process.env.AZURE_WEBAPP_URL || 'https://alonix-backend.azurewebsites.net')
                    : 'http://localhost:3000',
                description: process.env.NODE_ENV === 'production'
                    ? 'Production Server'
                    : 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        profilePhoto: { type: 'string' },
                    },
                },
                Activity: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        activityType: { type: 'string' },
                        date: { type: 'string', format: 'date-time' },
                        status: { type: 'string' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        type: { type: 'string' },
                        status: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions - use absolute paths
    apis: [
        path.join(__dirname, '../server.js'),
        path.join(__dirname, '../routes/*.js')
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
