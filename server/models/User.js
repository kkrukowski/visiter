const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Opinion = require("./OpinionForUser");

const userSchema = new Schema({
  email: String,
  name: String,
  surname: String,
  sex: {type: String, default: "Mężczyzna"},
  city: String,
  country: String,
  phone: String,
  password: String,
  invCode: String,
  role: String,
  opinions: { type: [Opinion.schema], require: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
