const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const Assets = require("./models/assets.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { assetSchema } = require("./schema.js");

const MongoURL = "mongodb://127.0.0.1:27017/hardwareHub";
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MongoURL);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const validateAssets = (req, res, next) => {
  let { error } = assetSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get(
  "/show",
  wrapAsync(async (req, res) => {
    const allAssets = await Assets.find({});
    res.render("show.ejs", { allAssets });
  })
);

app.get(
  "/assets/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id);
    res.render("edit.ejs", { assets });
  })
);

app.put(
  "/assets/:id",
  validateAssets,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Assets.findByIdAndUpdate(id, { ...req.body });
    res.redirect("/show");
  })
);

app.get(
  "/assets/new",
  wrapAsync((req, res) => {
    res.render("new.ejs");
  })
);

app.post(
  "/assets/new",
  validateAssets,
  wrapAsync(async (req, res) => {
    const newAsset = new Assets(req.body);
    await newAsset.save();
    res.redirect("/show");
  })
);

app.delete(
  "/assets/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Assets.findByIdAndDelete(id);
    res.redirect("/show");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // ✅ If headers are already sent, pass the error to the default Express error handler
  }
  let { status = 500, message = "Something Wrong Occured!" } = err;
  res.status(status).render("error.ejs", { message });
  // res.status(status).send(message);
});

app.listen("3000", (req, res) => {
  console.log("server is listening to port 3000");
});
