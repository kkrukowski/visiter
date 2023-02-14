const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opinionSchema = new Schema({
    rating: Number,
    comment: String,
    ownerId: { type: Schema.Types.ObjectId, ref: "User" }
});

const Opinion = mongoose.model("OpinionForBusiness", opinionSchema);

module.exports = Opinion;
