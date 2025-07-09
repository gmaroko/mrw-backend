let mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
    reviewId: {type: mongoose.Types.ObjectId, ref: 'Review', required: true},
    userId: {type:  mongoose.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    hasParent: {type: Boolean, default: false},  // support for nested comments / reply to comments
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    deleted : {type : Boolean, default: false}
});

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;