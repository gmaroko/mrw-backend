const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

class SwaggerDoc {
    constructor() {
        this.swaggerSpec = this.generateSwaggerSpec();
    }

    generateSwaggerSpec = () => {
        const options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Movie Review API',
                    version: '0.0.1',
                    description: 'Movie Review APT2080-G8 Project - API Documentation!',
                    contact: {
                        name: "G8 Team",
                        email: "gmaroko@usiu.ac.ke"
                    }
                },
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                    },
                },
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                servers: [
                    {
                        url: `${process.env.HOST}:${process.env.PORT || 3000}`,
                    },
                ],
            },
            apis: [path.join(__dirname, '../routes/auth.js')],
        };

        return swaggerJSDoc(options);
    };
}

module.exports = new SwaggerDoc().swaggerSpec;
