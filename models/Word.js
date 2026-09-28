const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  word:  { type: String, required: true, uppercase: true },
  date:  { type: String, required: true, unique: true }, // "2024-01-15"
});

module.exports = mongoose.model("Word", WordSchema);