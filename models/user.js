let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    email: {type: String},
    fullName: {type: String},
    password: {type: String},
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    isActive : {type : Boolean, default: true},
    deleted : {type : Boolean, default: false}
});

let User = mongoose.model('User', userSchema);

module.exports = User;