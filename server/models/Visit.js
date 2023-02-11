const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Service = require("./Service");

const visitSchema = new Schema({
  createdAt: String,
  visitDate: String,
  // businessId: { type: Schema.Types.ObjectId, ref: "Business" },
  // workerId: { type: Schema.Types.ObjectId, ref: "User" },
  // service: Service.schema,
  businessId: String,
  workerId: String,
  service: String,
  status: { type: String, enum: ["ended", "canceled", "waiting"] },
});

const Visit = mongoose.model("Visit", visitSchema);

module.exports = Visit;
