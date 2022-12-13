var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema({
    id: String,
    email: String,
    username: String,
    secondname: String,
    sex: String,
    password: String,
    role: String
});

User = mongoose.model('User', userSchema);

module.exports = User;