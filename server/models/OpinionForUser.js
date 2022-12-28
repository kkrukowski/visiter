const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opinionSchema = new Schema({
    rating: Number,
    comment: String,
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    ownerName: String,
    businessName: String,
    businessId: { type: Schema.Types.ObjectId, ref: "Business" }
});

const Opinion = mongoose.model("OpinionForUser", opinionSchema);

module.exports = Opinion;
