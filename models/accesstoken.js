let mongoose = require('mongoose');

let accessTokenSchema = new mongoose.Schema({
    email: {type: String},
    token: {type: String},
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    deleted : {type : Boolean, default: false}
});

let AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports = AccessToken;