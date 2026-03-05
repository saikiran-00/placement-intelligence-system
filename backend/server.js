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
    return res.status(400).json({ message: "Invalid token" });
  }
};

// ================= BASIC ROUTE =================
app.get("/", (req, res) => {
  res.json({ message: "Backend Running 🚀" });
});


// =================================================
// 🔥 DEFAULT ADMIN CREATION
// =================================================
const createDefaultAdmin = async () => {
  const adminExists = await User.findOne({ role: "admin" });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Main Admin",
      email: "admin@placement.com",
      password: hashedPassword,
      role: "admin",
      cgpa: 0,
      aptitudeScore: 0,
      codingScore: 0,
      placementScore: 0,
      category: "Admin"
    });

    console.log("✅ Default Admin Created");
    console.log("📧 Email: admin@placement.com");
    console.log("🔐 Password: admin123");
  }
};


// =================================================
// 🔐 LOGIN
// =================================================
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


// =================================================
// 👨‍💼 ADMIN CREATES STUDENT
// =================================================
app.post("/create-student", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can create students" });

    const { name, email, password, cgpa = 0, aptitudeScore = 0, codingScore = 0 } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email & password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const placementScore =
      0.4 * codingScore +
      0.3 * aptitudeScore +
      0.3 * (cgpa * 10);

    let category = "High Risk";
    if (placementScore >= 75) category = "Placement Ready";
    else if (placementScore >= 50) category = "Needs Improvement";

    const student = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      cgpa,
      aptitudeScore,
      codingScore,
      placementScore,
      category
    });

    await student.save();

    res.status(201).json({ message: "Student created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =================================================
// 👁 GET USERS
// =================================================
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


// =================================================
// 🗑 DELETE STUDENT (ADMIN ONLY)
// =================================================
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


// =================================================
// 🔄 DATABASE CONNECTION
// =================================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");
    await createDefaultAdmin();
  })
  .catch(err => console.log("Mongo Error:", err));


// =================================================
// 🚀 SERVER START
// =================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));