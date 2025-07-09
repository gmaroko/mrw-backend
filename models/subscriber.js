let mongoose = require('mongoose');

let subscriberSchema = new mongoose.Schema({
    email: {type : String},
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    isActive : {type : Boolean, default: true},
    deleted : {type : Boolean, default: false}
});
  

let Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;