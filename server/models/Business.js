const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const User = require("./User");

let businessSchema = new Schema({
  name: String,
  description: String,
  logo: {
    type: String,
    required: false,
  },
  ownerId: { type: Schema.Types.ObjectId, ref: "User"},
  address: String,
  phone: String,

  workers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  opinions: [{ type: Schema.Types.ObjectId, ref: "OpinionForBusiness" }],
  services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
});

businessSchema.plugin(mongoosePaginate);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
