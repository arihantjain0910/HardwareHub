const express = require("express");
const router = express.Router();
const Users = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signUp", (req, res) => {
  res.render("signUp.ejs");
});

router.post("/signUp", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let isAdmin = req.body.isAdmin ? true : false;
    let newUser = new Users({ username, email, isAdmin });
    let registerUser = await Users.register(newUser, password);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome To HardwareHub!");
      res.redirect("/index");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signUp");
  }
});

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/index";
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/index");
  });
});

module.exports = router;
