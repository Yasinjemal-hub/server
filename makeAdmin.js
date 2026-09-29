// server/makeAdmin.js
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email: "your@email.com" },   // 👈 change this
    { isAdmin: true },
    { new: true }
  );
  console.log(`${user.username} is now admin ✅`);
  process.exit();
});