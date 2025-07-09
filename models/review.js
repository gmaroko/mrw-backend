let mongoose = require('mongoose');

let reviewSchema = new mongoose.Schema({
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    movieId: {type: String},
    rating: {type: Number, min: 1, max: 5, default: 1},
    content: {type: String},
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    deleted : {type : Boolean, default: false}
});

let Review = mongoose.model('Review', reviewSchema);

module.exports = Review;