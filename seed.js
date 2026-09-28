const mongoose = require("mongoose");
const Word = require("./models/Word");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Word.create({ word: "CRANE", date: "2024-01-15" });
  console.log("Word seeded!");
  process.exit();
});