const { default: axios, HttpStatusCode } = require("axios");
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const HelperMethods = require("../utils/sharedutils");

// To encrypt password
const bcrypt = require('bcrypt');
const AccessToken = require("../models/accesstoken");

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login User
 *     description: Login to access DB.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gmaroko@usiu.ac.ke
 *               password:
 *                 type: string
 *                 format: password
 *                 example: changethis
 *     responses:
 *       200:
 *         description: Successful response with user information and access info.
 *       401:
 *          description: Authentication error
 *       400:
 *          description: Login bad request / Server error
 */
router.post("/login", async(req, res)=>{
    console.log(`Login Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);
    const {email, password} = req.body;

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = "Authentication Failed / Invalid user information";
    var data = {};
    var successful = false;

    if (email && password) {
        try {
            var userExists = await User.findOne({email: email});
            if (userExists){
                console.log(`User login ${email}`);
    
                // Validate password
                const passwordMatch = await bcrypt.compare(password, userExists.password);
                if (passwordMatch){
                    successful = true;
                    statusCode = HttpStatusCode.Ok.toString();
                    statusMessage = "Login successful";
                    userExists.password = "******";
                    data = {
                        "user": userExists,
                        "accessToken": HelperMethods.generateAccessToken(userExists.email)
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
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
 * /logout:
 *   post:
 *     summary: Logout User
 *     security:
 *      - bearerAuth: []
 *     description: Logout User.
 *     responses:
 *       200:
 *         description: Successful logout.
 *       400:
 *          description: Logout bad request / Server error
 */
router.post("/logout", async (req, res) =>{
    console.log(`Logout Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);
    const {email} = req.body;

    statusMessage = "Logout Failed / Invalid user information";

     // get user email from access token
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (accessToken) {
        try {
            const decoded = HelperMethods.decodeAccessToken(accessToken);
            if (decoded && decoded.email) {
                if (decoded.email !== email) {
                    console.log(`Session email does not match request info: sesson = ${email}, request = ${decoded.email}`); // we'll delete all access tokens for this email anyways - if they exist
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // delete all access tokens for this email
    await AccessToken.updateMany(
        {"email": email},
        {deleted: true}   
    )
    res.json(
        HelperMethods.makeResponseObject(
            HttpStatusCode.Ok.toString(),
            "User logged out successfully",
            true,
            null
        )
    );
    res.end();

});

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset Account Password
 *     description: Reset Account Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gmaroko@usiu.ac.ke
 *     responses:
 *       200:
 *         description: Successful reset / Password reset email sent.
 *       400:
 *          description: Reset password bad request / Server error
 */
router.post("/reset-password", async (req, res) =>{
    console.log(`Reset Password Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);
    const {email} = req.body;

    var userExists = await User.findOne({email: email});
    if (userExists){
        // delete all access tokens for this email
        var PASS_LEN = 6;
        await AccessToken.updateMany(
            {"email": email},
            {deleted: true}   
        )

        const password = HelperMethods.generateRandomCharacters(PASS_LEN);
        const hashedPassword = await bcrypt.hash(password, 10);
        userExists.password = hashedPassword;
        userExists.save();

        // send email
        payload = {
            "to": email,
            "subject": "MRW: Password Recovery",
            "text": `Dear ${userExists.fullName}, Use the temporary password: ${password} to access your MRW account.`,
            "html":  `<p>Dear ${userExists.fullName},<br> Use the temporary password: <u><b>${password}</b></u> to access your MRW account.</p>`
        };
        HelperMethods.sendEmail(payload);

    }

    res.json(
        HelperMethods.makeResponseObject(
            HttpStatusCode.Ok.toString(),
            "A temporary password will be sent to your email if it exists in our records",
            true,
            null
        )
    );
    res.end();

});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create new MRW account
 *     description: Create a new MRW account with email, password, and full name.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gmaroko@usiu.ac.ke
 *               password:
 *                 type: string
 *                 format: password
 *                 example: changethis
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: New MRW account created.
 *       400:
 *         description: Create account bad request / Server error
 */

router.post("/register", async(req, res)=>{
    console.log(`Register New Account Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);
    // payload
    const {email, password, fullName} = req.body;

    // Response variables
    var statusCode = HttpStatusCode.BadRequest.toString();
    var statusMessage = null;
    var data = {};
    var successful = false;

    // Payload
    var newUserAccount = {
        "email": email,
        "fullName": fullName,
        "password": password
    }
    var existingUser = await User.findOne({email: newUserAccount.email});

    if(existingUser){
        statusMessage = "Error creating your account: Email already in use";
        console.log("User with this email already exists");
    } else {
        // encode password
        const hashedPassword = await bcrypt.hash(password, 10);
        newUserAccount.password = hashedPassword;

        try {
            newUser = await User.create(newUserAccount);
            newUser.password = "*******";
            if(newUser){
                statusCode = HttpStatusCode.Created.toString();
                statusMessage = "User registered successfully";
                successful = true;
                data = {    
                    "user": newUser,
                    "accessToken": HelperMethods.generateAccessToken(newUser.email)
                }

                // send email to user
                payload = {
                    "to": email,
                    "subject": "MRW: Welcome",
                    "text": "Your MRW Account was created successfully. Welcome and Enjoy our awesome services!",
                    "html": "<h3>Your MRW Account was created successfully. Welcome and Enjoy our awesome services!</h3>"
                };
                HelperMethods.sendEmail(payload);
            }
        } catch (error) {
            console.log(error);
            statusMessage = "User registered failed";
            successful = false;
        }
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
 * /me:
 *   get:
 *     summary: View User Profile
 *     security:
 *       - bearerAuth: []
 *     description: View User Profile.
 *     responses:
 *       200:
 *         description: Successful response with user profile information.
 *       401:
 *          description: Authentication error
 *       400:
 *          description: Profile bad request / Server error
 */
router.get("/me", async(req, res)=>{
    console.log(`Profile Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = "Authentication Failed / Invalid user information";
    var data = {};
    var successful = false;

    
    // get user email from access token
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (accessToken) {
        try {
            const decoded = HelperMethods.decodeAccessToken(accessToken);
            if (decoded && decoded.email) {
                const userEmail = decoded.email;
                var user = await User.findOne({email: userEmail});
                if (user) { 
                    data = user;
                    data.password = "******"; // hide password string
                    statusCode = HttpStatusCode.Ok.toString();
                    statusMessage = "User profile fetched successfully";
                    successful = true;
                }
            }
        } catch (error) {
            console.log(error);
        }
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