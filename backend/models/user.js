const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  cgpa: Number,
  aptitudeScore: { type: Number, default: 0 },
  codingScore: { type: Number, default: 0 },
  placementScore: { type: Number, default: 0 },
  category: { type: String, default: "High Risk" },

  // 🔥 NEW FIELD
  improvementPlan: [
    {
      day: String,
      task: String,
      completed: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);