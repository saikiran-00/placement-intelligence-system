const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({ origin: "*" }));
app.use(express.json());

// ================= AUTH MIDDLEWARE =================
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

// ================= BASIC ROUTE =================
app.get("/", (req, res) => {
  res.json({ message: "Backend Running Securely 🚀" });
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      cgpa,
      aptitudeScore,
      codingScore
    } = req.body;

    if (!name || !email || !password || !cgpa || aptitudeScore == null || codingScore == null) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const placementScore =
      0.4 * codingScore +
      0.3 * aptitudeScore +
      0.3 * (cgpa * 10);

    let category = "High Risk";
    if (placementScore >= 75) category = "Placement Ready";
    else if (placementScore >= 50) category = "Needs Improvement";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      cgpa,
      aptitudeScore,
      codingScore,
      placementScore,
      category,
      improvementPlan: []
    });

    await newUser.save();

    res.status(201).json({ message: "User Registered Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      id: user._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET USERS (PRIVATE SCORES) =================
app.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const users = await User.find();
      return res.json(users);
    } else {
      const user = await User.findById(req.user.id);
      return res.json([user]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE SCORE =================
app.put("/update-score/:id", auth, async (req, res) => {
  try {
    const { aptitudeScore, codingScore } = req.body;

    if (aptitudeScore == null || codingScore == null) {
      return res.status(400).json({ message: "Scores are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only admin OR same student can update
    if (req.user.role !== "admin" && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    user.aptitudeScore = aptitudeScore;
    user.codingScore = codingScore;

    user.placementScore =
      0.4 * codingScore +
      0.3 * aptitudeScore +
      0.3 * (user.cgpa * 10);

    if (user.placementScore < 50) user.category = "High Risk";
    else if (user.placementScore < 75) user.category = "Needs Improvement";
    else user.category = "Placement Ready";

    // Generate Improvement Plan
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
        { day: "Day 3", task: "Mini mock test", completed: false }
      ];
    } else {
      plan = [
        { day: "Day 1-2", task: "Basic arithmetic concepts", completed: false },
        { day: "Day 3-4", task: "Logical reasoning foundation", completed: false }
      ];
    }

    user.improvementPlan = plan;

    await user.save();

    res.json({ message: "Score updated", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE USER =================
app.delete("/delete/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can delete" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error:", err));

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});