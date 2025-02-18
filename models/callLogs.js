const { number } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const callLogSchema = new Schema({
  plant: String,
  department: String,
  employeeCode: String,
  employeeName: String,
  category: String,
  serialNumber: String,
  callNumber: Number,
  problemDescription: String,
  reportingDate: Date,
  attendingDate: {
    type: Date,
    // default: Date.now(),
  },
  attendedBy: String,
  solutionDate: Date,
  remarks: String,
  sendDate: Date,
  gatePassNumber: Number,
  receiveDate: Date,
  challanNumber: Number,
  serviceProviderName: String,
});

module.exports = mongoose.model("CallLogs", callLogSchema);
