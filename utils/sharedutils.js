const { HttpStatusCode } = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const AccessToken = require("../models/accesstoken");

class HelperMethods {
    // Database connection
    getDbConnection = () => {
        const DB_URL = process.env.DB_URL;
        let options = {
            family : 4
        };
        mongoose.connect(DB_URL, options);
        const db = mongoose.connection;
    
        db.on('error', (err) => {
            console.log('Failed to connect to DB server!')
            console.log(err);
        });
    
        db.once('open', (event)=>{
            console.log('Connection to DB server successful!')
        });
        return db;
    }

    // Make HTTP response object
    makeResponseObject =  (code, msg, success, data) => {
        return {
            "statusCode": code,
            "statusMessage": msg,
            "successful": success,
            "data": data
        }
    }

    // Generate user access token
    generateAccessToken = (email) => {
        const token = jwt.sign(
            { "email": email }, process.env.JWT_KEY,
            {
                expiresIn: '1h',
            }
        );

        // store token
        AccessToken.create({"token": token,  "email": email});
        return token;
    }

    // Verify access token
    verifyAccessToken = async (req, res, next) => {
        console.log("Verify token middleware ");
        var token = req.header('Authorization');
        token = token.replace("Bearer ", "");

        var statusCode = HttpStatusCode.Unauthorized.toString();
        var statusMessage = "Access denied";

        if (!token){
            console.log("Missing authorization header");
            res.json(this.makeResponseObject(
                statusCode,
                statusMessage,
                false,
                null
            ));
            return;
        } else {
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                var accessToken = await AccessToken.findOne({
                    "email": decoded.email,
                    "token": token,
                    "deleted": false
                });
                console.log(accessToken);
                if(accessToken){
                    req.email = decoded.email;
                    next();
                } else {
                    statusMessage = "Invalid token";
                    res.json(this.makeResponseObject(
                        statusCode,
                        statusMessage,
                        false,
                        null
                    ));
                    return;
                }
                
            } catch (error) {
                console.log(error);
                res.json(this.makeResponseObject(
                    statusCode,
                    statusMessage,
                    false,
                    null
                ));
                return;
            }
        }
    }

    // Send email
    sendEmail = async (emailRequest) => {
        var transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        try {
            const info = await transport.sendMail({
                from: process.env.EMAIL_SENDER, // sender
                to: emailRequest.to, // list of receivers
                subject: emailRequest.subject,
                text: emailRequest.text, // plain text body
                html: emailRequest.html, // html body
            });
            console.log("Email message sent: %s", info.messageId);

        } catch (error){
            console.log("Send email failed. ");
            console.log(error);
        }
    }

    generateRandomCharacters = length => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

    decodeAccessToken = (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            return decoded;
        } catch (error) {
            console.error("Error decoding access token:", error);
            return null;
        }
    }
};

module.exports = new HelperMethods();