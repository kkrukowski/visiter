var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const opinionSchema = new Schema({
    id: String,
    rating: Number,
    comment: String,
    ownerId: String
})

const Opinion = mongoose.model('Opinion', opinionSchema);

module.exports = Opinion;