var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Opinion = require('./Opinion');

const userSchema = new Schema({
    id: String,
    email: String,
    username: String,
    secondname: String,
    sex: String,
    password: String,
    opinions: {type: [Opinion.schema], required: false},
    role: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;