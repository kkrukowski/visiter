var mongoose = require("mongoose");
var Schema = mongoose.Schema;
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

  workers: { type: [User.schema], require: false, default: [] },
  opinions: { type: [Opinion.schema], require: false, default: [] },
  services: { type: [Service.schema], require: false, default: [] },
});

businessSchema.plugin(mongoosePaginate);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
