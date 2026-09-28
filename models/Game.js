const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date:    { type: String },        // "2024-01-15"
  guesses: { type: [String] },      // ["CRANE", "SLOTH"]
  won:     { type: Boolean },
  tries:   { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Game", GameSchema);