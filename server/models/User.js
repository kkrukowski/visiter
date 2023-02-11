const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Opinion = require("./OpinionForUser");
const Visit = require("./Visit");

const userSchema = new Schema({
  email: String,
  name: String,
  surname: String,
  sex: { type: String, default: "Mężczyzna" },
  city: String,
  country: String,
  phone: String,
  password: String,
  invCode: String,
  role: String,
  opinions: { type: [Opinion.schema] },
  clientVisits: [{ type: Schema.Types.ObjectId, ref: "Visit" }],
  workerVisits: [{ type: Schema.Types.ObjectId, ref: "Visit" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
