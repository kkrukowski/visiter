var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const serviceSchema = new Schema({
    name: String,
    price: Number,
    description: { type: String, required: false },
    duration: { type: Number, required: false }
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;