
let mongoose = require('mongoose');

let movieSchema = new mongoose.Schema({
    title: {type: String},
    genres: {type: [String]},
    releaseDate: {type: String},
    posterUrl: {type: String},
    overview: {type: String},
    cachedAt: {type: Date, default: new Date()},
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()},
    deleted : {type : Boolean, default: false}
});

let Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;