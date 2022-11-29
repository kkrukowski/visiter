var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema({
    id: Number,
    email: String,
    username: String,
    password: String,
});

User = mongoose.model('User', userSchema);

module.exports = User;