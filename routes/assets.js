const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { assetSchema, callLogSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const CallLogs = require("../models/callLogs.js");
const Assets = require("../models/assets.js");
const User = require("../models/assets.js");
const { isLoggedIn } = require("../middleware.js");

const validateAssets = (req, res, next) => {
  let { error } = assetSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.get(
  "/assets/edit/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const assets = await Assets.findById(id);
    res.render("edit.ejs", { assets });
  })
);

router.get(
  "/assets/:id/show/view",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id)
      .populate("callLogs")
      .populate("owner");
    console.log(assets.owner);
    if (!assets) {
      req.flash("error", "Asset does not exists!");
      res.redirect("/index");
    }
    // console.log(assets);
    res.render("show.ejs", { assets });
  })
);

router.put(
  "/assets/:id",
  isLoggedIn,
  validateAssets,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Assets.findByIdAndUpdate(id, { ...req.body });
    req.flash("success", "Successfully updated!");
    res.redirect(`/assets/${id}/show/view`);
  })
);

router.get(
  "/assets/new",
  isLoggedIn,
  wrapAsync((req, res) => {
    res.render("new.ejs");
  })
);

router.post(
  "/assets/new",
  validateAssets,
  wrapAsync(async (req, res) => {
    const newAsset = new Assets(req.body);
    newAsset.owner = req.user._id;
    await newAsset.save();
    req.flash("success", "New Asset Created");
    res.redirect("/index");
  })
);

router.delete(
  "/assets/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // Update deleteFlag instead of deleting the record
    await Assets.findByIdAndUpdate(id, { deleteFlag: true });
    req.flash("success", "Successfully Deleted!");
    res.redirect("/index");
  })
);

module.exports = router;
