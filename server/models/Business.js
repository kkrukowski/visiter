var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = require("./User");
const Opinion = require("./Opinion");
const Service = require("./Service");

const businessSchema = new Schema({
    id: String,
    name: String,
    description: String,
    logo: {
        type: String,
        required: false
    },
    owner: {type: User.schema, require: true},
    adress: String,
    phone: String,


    workers: {type: [User.schema], require: false},
    opinions: {type: [Opinion.schema], require: false},
    services: {type: [Service.schema], require: false},
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;