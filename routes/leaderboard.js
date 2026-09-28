const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  // Only show leaderboard if user joined Telegram
  const user = await User.findById(req.user.id);
  if (!user.telegramJoined) {
    return res.status(403).json({ message: "Join our Telegram channel to unlock the leaderboard!" });
  }
  const top = await User.find().sort({ points: -1 }).limit(20).select("username points streak");
  res.json(top);
});

// Mark user as joined Telegram (called after they click "I joined")
router.post("/verify-join", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { telegramJoined: true });
  res.json({ message: "Unlocked!" });
});

module.exports = router;