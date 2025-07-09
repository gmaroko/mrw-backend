const { default: axios, HttpStatusCode } = require("axios");
const express = require('express');
const router = express.Router();
const HelperMethods = require("../utils/sharedutils");
const Review = require("../models/review");

const defaultStatusMessage = "Invalid request / Invalid user information";

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new Review
 *     description: Create a new movie review.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: The ID of the movie being reviewed.
 *               content:
 *                 type: string     
 *                 description: The text of the review.
 *               rating:
 *                 type: number
 *                 format: float
 *                 description: The rating given to the movie (1-5).
 *               userId:
 *                 type: string
 *                 description: The ID of the user creating the review.
 *     required:
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with review information.
 *       401:
 *         description: Authentication error    
 *      400:
 *        description: Review creation bad request / Server error
 * */
router.post("/", async (req, res) => {
    console.log(`New Review Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    let newReview = req.body;
    if (newReview && newReview.movieId && newReview.content && newReview.rating && newReview.userId) {
        try {
            newReview = await Review.create(newReview);
            if (newReview) {
                successful = true;
                statusCode = HttpStatusCode.Ok.toString();
                statusMessage = "Review created successfully";
                data = newReview;
            } else {
                statusMessage = "Review creation failed";
            }
        } catch (error) {
            statusMessage = "Error creating review";
            statusCode = HttpStatusCode.InternalServerError.toString();
        }

        res.json(
            HelperMethods.makeResponseObject(
                statusCode,
                statusMessage,
                successful,
                data
            )
        );
        res.end();
    }
});


/**
 * @swagger
 * /{movieId}:
 *   get:
 *     summary: View Movie Reviews
 *     security:
 *       - bearerAuth: [] 
 *     description: Retrieve all reviews for a specific movie by its ID.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to retrieve reviews for.
 *     responses:
 *       200:
 *         description: Successful response with movie review details.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Bad request or server error
 */
router.get("/:movieId", async (req, res) => {
    console.log(`Movie Reviews List Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    const movieId = req.params.movieId;

    try {
        data = await Review.find({ movieId: movieId, deleted: false }).populate('userId', 'email fullName');
        if (data && data.length > 0) {
            successful = true;
            statusCode = HttpStatusCode.Ok.toString();
            statusMessage = "Reviews retrieved successfully";
        } else {
            statusMessage = "No reviews found for this movie or invalid.";
        }
    } catch (error) {
        statusMessage = "Error retrieving reviews";
        statusCode = HttpStatusCode.InternalServerError.toString();
    }

    res.json(
        HelperMethods.makeResponseObject(
            statusCode,
            statusMessage,
            successful,
            data
        )
    );
    res.end();
});

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Modify Movie Review
 *     security:
 *       - bearerAuth: [] 
 *     description: Modify an existing movie review by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie review to modify.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Successful response with updated movie review details.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Bad request or server error
 */
router.put("/:id", async (req, res) => {
    console.log(`Modify Review Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    const reviewId = req.params.id;
    const updatedReview = req.body;
    if (reviewId && updatedReview) {
        try {
            const review = await Review.findById(reviewId);

            if (review) {
                // TODO: get userId from token
                if (updatedReview.userId && updatedReview.userId !== review.userId.toString()) {
                    statusMessage = "Invalid user credential";
                } else {
                    // Update review fields
                    review.content = updatedReview.content || review.content;
                    review.rating = updatedReview.rating || review.rating;
                    review.updatedAt = new Date();

                    // Save the updated review
                    const savedReview = await review.save();
                    successful = true;
                    statusCode = HttpStatusCode.Ok.toString();
                    statusMessage = "Review updated successfully";
                    data = savedReview;
                }
            } else {
                statusMessage = "Review not found";
            }
        } catch (error) {
            statusMessage = "Error updating review";
            statusCode = HttpStatusCode.InternalServerError.toString();
        }
    } else {
        statusMessage = "Invalid request data";
    }
    res.json(
        HelperMethods.makeResponseObject(
            statusCode,
            statusMessage,
            successful,
            data
        )
    );
    res.end();
});


/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete Movie Review
 *     security:
 *       - bearerAuth: [] 
 *     description: Delete a movie review by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie review to delete.
 *     responses:
 *       200:
 *         description: Successful response with movie review details.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Bad request or server error
 */
router.delete("/:id", async (req, res) => {
    console.log(`Remove Review Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;
    const reviewId = req.params.id;
    if (reviewId) {
        try {
            const review = await Review.findById(reviewId);
            if (review) {
                // Mark review as deleted
                review.deleted = true;
                review.updatedAt = new Date();

                // Save the updated review
                const savedReview = await review.save();
                successful = true;
                statusCode = HttpStatusCode.Ok.toString();
                statusMessage = "Review deleted successfully";
                data = savedReview;
            } else {
                statusMessage = "Review not found";
            }
        } catch (error) {
            statusMessage = "Error deleting review";
            statusCode = HttpStatusCode.InternalServerError.toString();
        }
    } else {
        statusMessage = "Invalid request data";
    }
    res.json(
        HelperMethods.makeResponseObject(
            statusCode,
            statusMessage,
            successful,
            data
        )
    );
    res.end();
});


module.exports = router
