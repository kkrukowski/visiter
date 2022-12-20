var mongoose = require('mongoose');
var Schema = mongoose.Schema;

serviceSchema = new Schema({
    id: String,
    name: String,
    price: Float

})

Service = mongoose.model('Service', userSchema);

module.exports = Service;