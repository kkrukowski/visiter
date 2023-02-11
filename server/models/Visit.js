const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitSchema = new Schema({
  createdAt: String,
  visitDate: String,
  businessId: { type: Schema.Types.ObjectId, ref: "Business" },
  workerId: { type: Schema.Types.ObjectId, ref: "User" },
  clientId: { type: Schema.Types.ObjectId, ref: "User" },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
  status: { type: String, enum: ["ended", "canceled", "waiting"] },
});

const Visit = mongoose.model("Visit", visitSchema);

module.exports = Visit;
