const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const Assets = require("./models/assets.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/show", async (req, res) => {
  const allAssets = await Assets.find({});
  res.render("show.ejs", { allAssets });
});

app.get("/assets/:id/edit", async (req, res) => {
  let { id } = req.params;
  const assets = await Assets.findById(id);
  res.render("edit.ejs", { assets });
});

app.put("/assets/:id", async (req, res) => {
  let { id } = req.params;
  await Assets.findByIdAndUpdate(id, { ...req.body });
  res.redirect("/show");
});

app.get("/assets/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/assets/new", async (req, res) => {
  const newAsset = new Assets(req.body);
  await newAsset.save();
  res.redirect("/show");
});

app.delete("/assets/:id", async (req, res) => {
  let { id } = req.params;
  await Assets.findByIdAndDelete(id);
  res.redirect("/show");
});

app.listen("3000", (req, res) => {
  console.log("server is listening to port 3000");
});
