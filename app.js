// Import libraries
const express = require("express");
var cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

// Import utils
const HelperMethods = require("./utils/sharedutils");

// Set up the application and db connection on startup
const app = express();

app.use(cors());


// Enable body in the req object
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//  Configure routes
const authRoutes = require('./routes/auth');
const commsRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/review');
const movieRoutes = require('./routes/movie');
const commentRoutes = require('./routes/comment');

app.use("/auth", authRoutes);
app.use("/comms", commsRoutes);
app.use("/reviews", reviewRoutes); 
app.use("/movies", movieRoutes);
app.use("/comments", commentRoutes);


// Setup PORT & Database
const db = HelperMethods.getDbConnection();
const PORT = process.env.PORT || 9467;

// Start server
app.listen(PORT, ()=>{
    console.log(`MRW backend service is listening on port ${PORT}`);
    console.log(`MRW Swagger UI available at ${process.env.HOST}:${PORT}/docs`);
});