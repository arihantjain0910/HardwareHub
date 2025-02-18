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
// const { assetSchema, callLogSchema } = require("./schema.js");
// const CallLogs = require("./models/callLogs.js");
const assets = require("./routes/assets.js");
const callLogs = require("./routes/callLogs.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");

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

app.use("/", assets);
app.use("/", callLogs);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get(
  "/index",
  wrapAsync(async (req, res) => {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let filter = {
      deleteFlag: false,
      ...(search && {
        $or: [
          { employeeName: { $regex: search, $options: "i" } },
          { employeeCode: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }),
    };
    const totalAssets = await Assets.countDocuments(filter);
    const allAssets = await Assets.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
    res.render("index.ejs", {
      allAssets,
      totalPages: Math.ceil(totalAssets / limit),
      currentPage: page,
      search,
    });
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
