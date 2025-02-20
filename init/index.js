const mongoose = require("mongoose");
const initData = require("./initData.js");
const Assets = require("../models/assets.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/hardwareHub";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Assets.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "67b6db6b52b29da970359bd1",
  }));
  await Assets.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
