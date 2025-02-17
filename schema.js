const Joi = require("joi");

module.exports.assetSchema = Joi.object({
  //   asset: Joi.object().required,
  serialNo: Joi.string(),
  location: Joi.string(),
  category: Joi.string(),
  manufacturer: Joi.string(),
  model: Joi.string(),
  modelNo: Joi.string(),
  employeeCode: Joi.string(),
  employeeName: Joi.string(),
  department: Joi.string(),
  ram: Joi.string(),
  hdd: Joi.string(),
  processor: Joi.string(),
  keyboard: Joi.string(),
  mouse: Joi.string(),
  ip: Joi.string(),
  monitor: Joi.string(),
  os: Joi.string(),
  antivirus: Joi.string(),
  warrenty: Joi.string(),
  office: Joi.string(),
});

module.exports.callLogSchema = Joi.object({
  callLog: Joi.object({
    callNumber: Joi.number().required(),
    problemDescription: Joi.string().required(),
  }).required(),
});
