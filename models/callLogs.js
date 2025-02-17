const { number } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const callLogSchema = new Schema({
  callNumber: Number,
  problemDescription: String,
  attendingTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("CallLogs", callLogSchema);
