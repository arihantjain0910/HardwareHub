const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { assetSchema, callLogSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const CallLogs = require("../models/callLogs.js");
const Assets = require("../models/assets.js");
const { isLoggedIn } = require("../middleware.js");

const validateCallLogs = (req, res, next) => {
  let { error } = callLogSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.get(
  "/assets/callLogs/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id).populate("callLogs");
    res.render("callLogs.ejs", { assets });
  })
);

router.post(
  "/assets/callLogs/:id",
  validateCallLogs,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id);
    let newCallLog = new CallLogs(req.body.callLog);

    assets.callLogs.push(newCallLog);
    await newCallLog.save();
    await assets.save();
    req.flash("success", "New call Log created!");
    res.redirect(`/assets/callLogs/${id}`);
  })
);

router.delete(
  "/assets/:id/callLog/:callLogId",
  wrapAsync(async (req, res) => {
    let { id, callLogId } = req.params;
    await Assets.findByIdAndUpdate(id, { $pull: { callLogs: callLogId } });
    await CallLogs.findByIdAndDelete(callLogId);
    req.flash("success", " Call Log deleted!");
    res.redirect(`/assets/callLogs/${id}`);
  })
);

router.get(
  "/assets/allCallLogs",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const allCallLogs = await CallLogs.find();
    res.render("showCallLogs.ejs", { allCallLogs });
  })
);

module.exports = router;
