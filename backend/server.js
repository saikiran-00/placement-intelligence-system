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

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email & password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const placementScore =
      0.4 * (codingScore || 0) +
      0.3 * (aptitudeScore || 0) +
      0.3 * ((cgpa || 0) * 10);

    let category = "High Risk";
    if (placementScore >= 75) category = "Placement Ready";
    else if (placementScore >= 50) category = "Needs Improvement";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      cgpa: cgpa || 0,
      aptitudeScore: aptitudeScore || 0,
      codingScore: codingScore || 0,
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

// ================= RESET PASSWORD =================
app.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });

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

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role !== "admin" && req.user.id !== user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    user.aptitudeScore = aptitudeScore;
    user.codingScore = codingScore;

    user.placementScore =
      0.4 * codingScore +
      0.3 * aptitudeScore +
      0.3 * (user.cgpa * 10);

    if (user.placementScore < 50) user.category = "High Risk";
    else if (user.placementScore < 75) user.category = "Needs Improvement";
    else user.category = "Placement Ready";

    // Generate improvement plan
    user.improvementPlan = [
      { task: "Practice aptitude daily", completed: false },
      { task: "Solve coding problems", completed: false },
      { task: "Revise core subjects", completed: false }
    ];

    await user.save();

    res.json({ message: "Score updated", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE TASK STATUS =================
app.put("/update-task/:userId/:index", auth, async (req, res) => {
  try {
    const { userId, index } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role !== "admin" && req.user.id !== user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    user.improvementPlan[index].completed =
      !user.improvementPlan[index].completed;

    await user.save();

    res.json(user);

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