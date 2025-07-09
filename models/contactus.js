let mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
    email: {type: String, required: true},
    content: {type: String, required: true},
    phoneNumber: {type: String, required: false, default: null},
    subject: {type: String, required: false, default: null},
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    deleted : {type : Boolean, default: false}
});

let Message = mongoose.model('Message', messageSchema);

module.exports = Message;