const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  name: String,
  price: Number,
  description: { type: String, required: false },
  duration: { type: Number, required: false },
  businessId: { type: Schema.Types.ObjectId, ref: "Business" },
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
