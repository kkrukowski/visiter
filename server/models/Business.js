var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = require("./User");
const Opinion = require("./Opinion");
const Service = require("./Service");

businessSchema = new Schema({
    id: String,
    name: String,
    description: String,
    logo: {
        type: String,
        required: false
    },
    ownerId: String,
    adress: String,
    phone: String,


    workers: [User],
    opinions: [Opinion],
    services: [Service]
});

Business = mongoose.model('Business', businessSchema);

module.exports = Business;