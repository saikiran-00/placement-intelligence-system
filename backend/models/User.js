const mongoose = require("mongoose");

const improvementSchema = new mongoose.Schema({
  day: { type: String },
  task: { type: String },
  completed: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Auth
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student"
    },

    // Academic Info
    cgpa: { type: Number, required: true },
    aptitudeScore: { type: Number, required: true },
    codingScore: { type: Number, required: true },

    // Placement Logic
    placementScore: { type: Number },
    category: { type: String },

    // Improvement Plan
    improvementPlan: [improvementSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);