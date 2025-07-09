const { default: axios, HttpStatusCode } = require("axios");
const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriber');
const HelperMethods = require("../utils/sharedutils");
const Message = require("../models/contactus");

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Send contact-us message 
 *     description: Submit a message through the contact-us form.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *             subject:
 *                 type: string
 *                 example: Inquiry about services
 *              phoneNumber:
 *                type: string
 *                format: phone
 *                description: Phone number
 *                pattern: "^[+][0-9]{1,3}[0-9]{9,15}$"
 *                minLength: 10
 *                maxLength: 15
 *                example: "+254712345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gmaroko@usiu.ac.ke
 *               content:
 *                 type: string
 *                 example: I would like to know more about your services.
 *     responses:
 *       200:
 *         description: Contact-us message sent successfully.
 *       400:
 *         description: Bad request or server error.
 */
router.post("/contact", async(req, res)=>{
    console.log(`Contact-Us Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    const {email, content, phoneNumber, subject} = req.body; 
    const adminEmail = "gmaroko@usiu.ac.ke";

    // Response variables
    var statusCode = HttpStatusCode.BadRequest.toString();
    var statusMessage = "Error sendng message";
    var data = {};
    var successful = false;

    try {
        var message = {
            "email": email,
            "content": content,
            "phoneNumber": phoneNumber,
            "subject": subject
        };

        var newMessage = await Message.create(message);

        if (newMessage){
            successful = true;
            statusMessage = "Message sent successfully";
            statusCode = HttpStatusCode.Ok.toString();

            // send email to user
            payload = {
                "to": email,
                "subject": "MRW: Your Message",
                "text": "We have received your message, our representative will get back to you ASAP!",
                "html": "<h3>We have received your message, our representative will get back to you ASAP!</h3>"
            };
            HelperMethods.sendEmail(payload);

            payloadAdmin = {
                "to": adminEmail,
                "subject": "MRW: A New Message on The Website",
                "text": `Dear Admin, There is a new message from a website user. Message details: ${JSON.stringify(message)}`,
                "html": `<p> Dear Admin, <br> There is a new message from a website user. <br> Message details: <br> ${JSON.stringify(message)}</p>`
            };
            HelperMethods.sendEmail(payloadAdmin);
        }
    } catch (error) {
        console.log("Error sendng message");
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
 * /subscribe:
 *   post:
 *     summary: Add newsletter subscriber 
 *     description: Add a new subscriber to the newsletter.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gmaroko@usiu.ac.ke
 *                 description: Email address of the subscriber
 *     responses:
 *       200:
 *         description: Newsletter subscription successful
 *       400:
 *         description: Subscribe bad request / Server error
 */
router.post("/subscribe", async(req, res) => {
    console.log(`Add Newsletter Subscibption Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);
    const {email} = req.body;

    const checkSubscriber = await Subscriber.findOne({email: email});

    // Response variables
    var statusCode = null;
    var statusMessage = null;
    var data = {};
    var successful = false;

    if (checkSubscriber) {
        console.log(`Subscriber with email ${email} already exists in the mailing list.`);
        statusCode = HttpStatusCode.Ok.toString();
        statusMessage = "User already in mailing list";
        successful = true;
    } else {
        console.log(`Adding new subscriber to mailing list`);
        var newUser = {
            "email": email
        }
        data = await Subscriber.create(newUser);
        if (data){
            statusCode = HttpStatusCode.Created.toString();
            statusMessage = "User added to mailing list";
            successful = true;
            console.log(`User added to mailing list`)

            // send email to user
            payload = {
                "to": email,
                "subject": "MRW: You've Been Added To the Mailing List",
                "text": "Welcome to MRW mailing list. You will receive newsletter updates henceforth",
                "html": "<h3>Welcome to MRW mailing list. You will receive newsletter updates henceforth</h3>"
            };
            HelperMethods.sendEmail(payload);
        }
    }

    res.json(
        HelperMethods.makeResponseObject(
            HttpStatusCode.Created.toString(),
            statusMessage,
            successful,
            data
        )
    );
    res.end();
});

module.exports = router;