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
const { assetSchema, callLogSchema } = require("./schema.js");
const CallLogs = require("./models/callLogs.js");

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

const validateCallLogs = (req, res, next) => {
  let { error } = callLogSchema.validate(req.body);
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
  "/assets/edit/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const assets = await Assets.findById(id);
    res.render("edit.ejs", { assets });
  })
);

app.get(
  "/assets/:id/show/view",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id);
    res.render("show.ejs", { assets });
  })
);

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

app.put(
  "/assets/:id",
  validateAssets,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Assets.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/assets/${id}/show/view`);
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
    res.redirect("/index");
  })
);

app.delete(
  "/assets/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // Update deleteFlag instead of deleting the record
    await Assets.findByIdAndUpdate(id, { deleteFlag: true });
    res.redirect("/index");
  })
);

app.get(
  "/assets/callLogs/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id).populate("callLogs");
    res.render("callLogs.ejs", { assets });
  })
);

app.post(
  "/assets/callLogs/:id",
  validateCallLogs,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const assets = await Assets.findById(id);
    let newCallLog = new CallLogs(req.body.callLog);
    assets.callLogs.push(newCallLog);
    await newCallLog.save();
    await assets.save();
    console.log("new call log saved!");
    res.redirect(`/assets/callLogs/${id}`);
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
