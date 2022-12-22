var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const serviceSchema = new Schema({
    id: String,
    name: String,
    price: Number

})

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;