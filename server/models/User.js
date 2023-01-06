const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Opinion = require("./OpinionForUser");

const userSchema = new Schema({
  email: String,
  name: String,
  surname: String,
  sex: String,
  password: String,
  role: String,
  opinions: { type: [Opinion.schema], require: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
