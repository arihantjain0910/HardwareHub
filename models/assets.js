const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assetSchema = new Schema({
  serialNo: String,
  location: String,
  category: String,
  manufacturer: String,
  model: String,
  modelNo: String,
  employeeCode: String,
  employeeName: String,
  department: String,
  ram: String,
  hdd: String,
  processor: String,
  keyboard: String,
  mouse: String,
  ip: String,
  monitor: String,
  os: String,
  antivirus: String,
  warrenty: String,
  office: String,
});

module.exports = mongoose.model("Assets", assetSchema);
