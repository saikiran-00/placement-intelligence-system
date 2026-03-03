const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ------------------- BASIC ROUTE -------------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ------------------- REGISTER USER -------------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, cgpa, aptitudeScore, codingScore } = req.body;

    if (!name || !email || !cgpa || aptitudeScore == null || codingScore == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const placementScore =
      (0.4 * codingScore) +
      (0.3 * aptitudeScore) +
      (0.3 * (cgpa * 10));

    let category = "High Risk";

    if (placementScore >= 75) {
      category = "Placement Ready";
    } else if (placementScore >= 50) {
      category = "Needs Improvement";
    }

    const newUser = new User({
      name,
      email,
      cgpa,
      aptitudeScore,
      codingScore,
      placementScore,
      category
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- GET ALL USERS -------------------
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- UPDATE SCORE -------------------
app.put("/update-score/:id", async (req, res) => {
  try {
    const { aptitudeScore, codingScore } = req.body;

    if (aptitudeScore == null || codingScore == null) {
      return res.status(400).json({ message: "Scores are required" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.aptitudeScore = aptitudeScore;
    user.codingScore = codingScore;

    user.placementScore =
      (0.4 * codingScore) +
      (0.3 * aptitudeScore) +
      (0.3 * (user.cgpa * 10));

    if (user.placementScore < 50) {
      user.category = "High Risk";
    } else if (user.placementScore < 75) {
      user.category = "Needs Improvement";
    } else {
      user.category = "Placement Ready";
    }

    // 🔥 Generate Improvement Plan
    let plan = [];

    if (aptitudeScore >= 75) {
      plan = [
        { day: "Day 1", task: "Solve 2 mock tests", completed: false },
        { day: "Day 2", task: "Practice HR interview questions", completed: false },
        { day: "Day 3", task: "Revise formulas", completed: false }
      ];
    } else if (aptitudeScore >= 50) {
      plan = [
        { day: "Day 1", task: "Arithmetic practice (20 questions)", completed: false },
        { day: "Day 2", task: "Logical reasoning basics", completed: false },
        { day: "Day 3", task: "Mini mock test", completed: false },
        { day: "Day 4", task: "Analyze mistakes", completed: false },
        { day: "Day 5", task: "Revise weak topics", completed: false }
      ];
    } else {
      plan = [
        { day: "Day 1-2", task: "Basic arithmetic concepts", completed: false },
        { day: "Day 3-4", task: "Logical reasoning foundation", completed: false },
        { day: "Day 5", task: "Practice 30 questions", completed: false },
        { day: "Day 6", task: "Revise mistakes", completed: false },
        { day: "Day 7", task: "Mini mock test", completed: false }
      ];
    }

    user.improvementPlan = plan;

    await user.save();

    res.json({
      message: "Scores updated & plan generated",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- UPDATE TASK STATUS -------------------
app.put("/update-task/:userId/:taskIndex", async (req, res) => {
  try {
    const { userId, taskIndex } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.improvementPlan[taskIndex].completed =
      !user.improvementPlan[taskIndex].completed;

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- DATABASE CONNECTION -------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// DELETE USER
app.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});