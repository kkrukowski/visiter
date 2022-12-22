const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: String,
  email: String,
  username: String,
  secondname: String,
  sex: String,
  password: String,
  role: String,
  opinions: [{ type: Schema.Types.ObjectId, ref: "Opinion" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
