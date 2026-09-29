const router = require("express").Router();
const admin = require("../middleware/admin");
const Word = require("../models/Word");
const User = require("../models/User");
const Game = require("../models/Game");

// ── Words ────────────────────────────────────────────────────────

// Get all scheduled words
router.get("/words", admin, async (req, res) => {
  const words = await Word.find().sort({ date: 1 });
  res.json(words);
});

// Add a new word
router.post("/words", admin, async (req, res) => {
  const { word, date } = req.body;
  if (!word || !date) return res.status(400).json({ message: "Word and date are required" });
  if (word.length !== 5) return res.status(400).json({ message: "Word must be 5 letters" });
  try {
    const newWord = await Word.create({ word: word.toUpperCase(), date });
    res.json(newWord);
  } catch {
    res.status(400).json({ message: "A word for that date already exists" });
  }
});

// Update a word
router.put("/words/:id", admin, async (req, res) => {
  const { word, date } = req.body;
  if (word && word.length !== 5) return res.status(400).json({ message: "Word must be 5 letters" });
  const updated = await Word.findByIdAndUpdate(
    req.params.id,
    { word: word?.toUpperCase(), date },
    { new: true }
  );
  res.json(updated);
});

// Delete a word
router.delete("/words/:id", admin, async (req, res) => {
  await Word.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ── Users ────────────────────────────────────────────────────────

// Get all users
router.get("/users", admin, async (req, res) => {
  const users = await User.find().select("-password").sort({ points: -1 });
  res.json(users);
});

// Toggle admin role
router.put("/users/:id/toggle-admin", admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isAdmin = !user.isAdmin;
  await user.save();
  res.json({ message: `${user.username} is now ${user.isAdmin ? "admin" : "regular user"}` });
});

// Reset a user's points
router.put("/users/:id/reset-points", admin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { points: 0, streak: 0 });
  res.json({ message: "Points reset" });
});

// ── Stats ────────────────────────────────────────────────────────

router.get("/stats", admin, async (req, res) => {
  const totalUsers    = await User.countDocuments();
  const totalGames    = await Game.countDocuments();
  const totalWins     = await Game.countDocuments({ won: true });
  const joinedTelegram = await User.countDocuments({ telegramJoined: true });

  // Games played per day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dailyActivity = await Game.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: "$date", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({ totalUsers, totalGames, totalWins, joinedTelegram, dailyActivity });
});

module.exports = router;