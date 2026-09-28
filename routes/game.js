const router = require("express").Router();
const auth = require("../middleware/auth");
const Word = require("../models/Word");
const Game = require("../models/Game");
const User = require("../models/User");

// Get today's word length only (never send the word to client!)
router.get("/today", auth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const wordDoc = await Word.findOne({ date: today });
  if (!wordDoc) return res.status(404).json({ message: "No word today" });

  // Check if already played
  const played = await Game.findOne({ userId: req.user.id, date: today });
  res.json({ wordLength: 5, alreadyPlayed: !!played, won: played?.won });
});

// Submit a guess
router.post("/guess", auth, async (req, res) => {
  const { guess } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const wordDoc = await Word.findOne({ date: today });
  if (!wordDoc) return res.status(404).json({ message: "No word today" });

  const secret = wordDoc.word.toUpperCase();
  const guessUpper = guess.toUpperCase();

  // Build result: "correct", "present", "absent"
  const result = Array(5).fill("absent");
  const secretArr = secret.split("");
  const guessArr = guessUpper.split("");

  // First pass: correct positions
  guessArr.forEach((letter, i) => {
    if (letter === secretArr[i]) {
      result[i] = "correct";
      secretArr[i] = null;
      guessArr[i] = null;
    }
  });

  // Second pass: present but wrong position
  guessArr.forEach((letter, i) => {
    if (!letter) return;
    const idx = secretArr.indexOf(letter);
    if (idx !== -1) {
      result[i] = "present";
      secretArr[idx] = null;
    }
  });

  const won = result.every((r) => r === "correct");

  // Save game after 6 guesses or win
  const game = await Game.findOne({ userId: req.user.id, date: today });
  const guessCount = (game?.guesses?.length || 0) + 1;

  if (!game) {
    await Game.create({ userId: req.user.id, date: today, guesses: [guessUpper], won, tries: 1 });
  } else {
    game.guesses.push(guessUpper);
    game.tries = guessCount;
    if (won) game.won = true;
    await game.save();
  }

  // Update points and streak on win
  if (won) {
    const user = await User.findById(req.user.id);
    user.points += Math.max(10, 60 - guessCount * 10); // more points for fewer guesses
    user.streak += 1;
    user.lastPlayed = new Date();
    await user.save();
  }

  res.json({ result, won, secret: won || guessCount >= 6 ? secret : null });
});

module.exports = router;