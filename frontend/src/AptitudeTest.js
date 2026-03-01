import React, { useState } from "react";

const questions = [
  {
    question: "What is 5 + 3?",
    options: ["6", "7", "8", "9"],
    answer: "8"
  },
  {
    question: "Which is a prime number?",
    options: ["4", "6", "9", "7"],
    answer: "7"
  },
  {
    question: "10 * 2 = ?",
    options: ["20", "10", "12", "22"],
    answer: "20"
  },
  {
    question: "Square root of 16?",
    options: ["3", "4", "5", "6"],
    answer: "4"
  },
  {
    question: "15 - 5 = ?",
    options: ["5", "10", "15", "20"],
    answer: "10"
  }
];

function AptitudeTest({ userId, onFinish }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        calculatedScore += 20; // 5 questions × 20 = 100
      }
    });

    setScore(calculatedScore);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/update-score/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aptitudeScore: calculatedScore,
            codingScore: 0
          })
        }
      );

      const data = await response.json();
      console.log("Updated:", data);

    } catch (error) {
      console.error("Error updating score:", error);
    }

    setLoading(false);
  };

  const getPlan = () => {
    if (score >= 75) {
      return {
        message: "You are Placement Ready! Focus on Mock Interviews.",
        timetable: [
          "Day 1: Solve 2 mock aptitude tests",
          "Day 2: Practice HR interview questions",
          "Day 3: Revise formulas",
          "Day 4: Coding practice",
          "Day 5: Mock interview simulation"
        ]
      };
    } else if (score >= 50) {
      return {
        message: "You need moderate improvement.",
        timetable: [
          "Day 1: Arithmetic practice (20 questions)",
          "Day 2: Logical reasoning basics",
          "Day 3: Practice test",
          "Day 4: Analyze mistakes",
          "Day 5: Revise weak topics",
          "Day 6: Mock test",
          "Day 7: Review & revise"
        ]
      };
    } else {
      return {
        message: "You need strong improvement plan.",
        timetable: [
          "Day 1-2: Basic arithmetic concepts",
          "Day 3-4: Logical reasoning foundation",
          "Day 5: Practice 30 questions",
          "Day 6: Revise mistakes",
          "Day 7: Mini mock test",
          "Week 2: Repeat with advanced problems"
        ]
      };
    }
  };

  // ---------------- RESULT SCREEN ----------------
  if (score !== null) {
    const plan = getPlan();

    return (
      <div style={{ marginTop: "20px", padding: "20px", background: "#eef" }}>
        <h2>Your Score: {score}%</h2>
        <h3>{plan.message}</h3>

        <h4>📅 Recommended Timetable:</h4>
        <ul>
          {plan.timetable.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        {loading ? (
          <p>Updating database...</p>
        ) : (
          <button onClick={onFinish} style={{ marginTop: "15px" }}>
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }

  // ---------------- TEST SCREEN ----------------
  return (
    <div style={{ marginTop: "20px", padding: "20px", background: "#f5f5f5" }}>
      <h2>Aptitude Test</h2>

      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <p>{q.question}</p>
          {q.options.map(option => (
            <label key={option} style={{ display: "block" }}>
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                onChange={() => handleChange(index, option)}
              />
              {option}
            </label>
          ))}
        </div>
      ))}

      <button onClick={handleSubmit}>Submit Test</button>
    </div>
  );
}

export default AptitudeTest;