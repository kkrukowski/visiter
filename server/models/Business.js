const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const User = require("./User");
const Opinion = require("./OpinionForBusiness");
const Service = require("./Service");

let businessSchema = new Schema({
  name: String,
  description: String,
  logo: {
    type: String,
    required: false,
  },
  owner: { type: User.schema, require: true },
  address: String,
  phone: String,

  workers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  opinions: { type: [Opinion.schema], require: false, default: [] },
  services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
});

businessSchema.plugin(mongoosePaginate);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
