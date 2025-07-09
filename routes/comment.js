const { default: axios, HttpStatusCode } = require("axios");
const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const HelperMethods = require("../utils/sharedutils");

const defaultStatusMessage = "Invalid request / Invalid user information";


/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new Review Comment
 *     security:
 *       - bearerAuth: [] 
 *     description: Create a new Review Comment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 example: "12345"
 *               userId:
 *                type: string
 *                example: "67890"
 * *               content:
 *                 type: string
 *                 example: "This movie was fantastic! I loved the plot and the acting."
 *     responses:
 *       200:
 *         description: Successful response with review comment information.
 *       401:
 *         description: Authentication error    
 *       400:
 *         description: Review comment creation bad request / Server error
 * */
router.post("/", async (req, res) => {
    console.log(`New Review Comment Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    let newComment = req.body;
    if (newComment && newComment.userId && newComment.reviewId && newComment.content) {
        try {
            newComment = await Comment.create(newComment);
            if (newComment) {
                successful = true;
                statusCode = HttpStatusCode.Ok.toString();
                statusMessage = "Review comment created successfully";
                data = newComment;
            } else {
                statusMessage = "Review comment creation failed";
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
 * /{reviewId}:
 *   get:
 *     summary: View list of comments under a specific review
 *     security:
 *       - bearerAuth: [] 
 *     description: Retrieve all comments for a specific review by its ID.
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to retrieve comments for.
 *     responses:
 *       200:
 *         description: Successful response with review comment details.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Bad request or server error
 */
router.get("/:reviewId", async (req, res) => {
    console.log(`Reviews Comment List Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    const reviewId = req.params.reviewId;

    try {
        data = await Comment.find({ reviewId: reviewId, deleted: false }).populate('userId', 'email fullName');
        if (data && data.length > 0) {
            successful = true;
            statusCode = HttpStatusCode.Ok.toString();
            statusMessage = "Reviews comments retrieved successfully";
        } else {
            statusMessage = "No comments found for this review or invalid.";
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

module.exports = router
