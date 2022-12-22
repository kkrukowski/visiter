const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opinionSchema = new Schema({
  id: String,
  rating: Number,
  comment: String,
  owner: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Opinion = mongoose.model("Opinion", opinionSchema);

module.exports = Opinion;
