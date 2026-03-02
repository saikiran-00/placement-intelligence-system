import React, { useEffect, useState } from "react";
import AptitudeTest from "./AptitudeTest";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from "recharts";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [aptitude, setAptitude] = useState("");
  const [coding, setCoding] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ Card color function (CORRECT PLACE)
  const getCardColor = (category) => {
    if (category === "Placement Ready") return "#e8f9f1";
    if (category === "Needs Improvement") return "#fff8e1";
    if (category === "High Risk") return "#fdecea";
    return "#f9f9f9";
  };

  const fetchUsers = () => {
    fetch("https://placement-intelligence-system-qdov.onrender.com/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddStudent = async () => {
    if (!name || !email || !cgpa || !aptitude || !coding) {
      alert("Please fill all fields");
      return;
    }

    await fetch("https://placement-intelligence-system-qdov.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        cgpa: Number(cgpa),
        aptitudeScore: Number(aptitude),
        codingScore: Number(coding)
      })
    });

    setName("");
    setEmail("");
    setCgpa("");
    setAptitude("");
    setCoding("");

    fetchUsers();
  };

  const totalStudents = users.length;
  const readyCount = users.filter(u => u.category === "Placement Ready").length;
  const improveCount = users.filter(u => u.category === "Needs Improvement").length;
  const riskCount = users.filter(u => u.category === "High Risk").length;

  const getRecommendation = (score) => {
    if (!score) return "No Data";
    if (score >= 80) return "🏢 Product Companies";
    if (score >= 60) return "🏢 Service Companies";
    return "📚 Skill Training Required";
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚀 Placement Intelligence Dashboard</h1>

      {/* Add Student */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Add Student</h2>

        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginLeft: "10px" }} />
        <input placeholder="CGPA" value={cgpa} onChange={e => setCgpa(e.target.value)} style={{ marginLeft: "10px" }} />
        <input placeholder="Aptitude Score" value={aptitude} onChange={e => setAptitude(e.target.value)} style={{ marginLeft: "10px" }} />
        <input placeholder="Coding Score" value={coding} onChange={e => setCoding(e.target.value)} style={{ marginLeft: "10px" }} />

        <button onClick={handleAddStudent} style={{ marginLeft: "10px" }}>
          Add
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <StatCard title="Total Students" value={totalStudents} color="#3498db" />
        <StatCard title="Placement Ready" value={readyCount} color="#2ecc71" />
        <StatCard title="Needs Improvement" value={improveCount} color="#f1c40f" />
        <StatCard title="High Risk" value={riskCount} color="#e74c3c" />
      </div>

      {/* Students */}
      <h2>👨‍🎓 Students</h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {users.map(user => (
          <div
            key={user._id}
            style={{
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              background: getCardColor(user.category)
            }}
          >
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>CGPA: {user.cgpa}</p>
            <p>Score: {user.placementScore?.toFixed(2)}</p>
            <strong>{user.category}</strong>
            <p>{getRecommendation(user.placementScore)}</p>

            {/* Mini Bar Chart */}
            {user.placementScore > 0 && (
              <BarChart width={300} height={200}
                data={[
                  { name: "Aptitude", value: user.aptitudeScore * 0.3 },
                  { name: "Coding", value: user.codingScore * 0.4 },
                  { name: "CGPA", value: user.cgpa * 10 * 0.3 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3498db" />
              </BarChart>
            )}

            {/* Test */}
            {selectedUser === user._id ? (
              <AptitudeTest
                userId={user._id}
                onFinish={() => {
                  setSelectedUser(null);
                  fetchUsers();
                }}
              />
            ) : (
              <button onClick={() => setSelectedUser(user._id)} style={{ marginTop: "10px" }}>
                Start Aptitude Test
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        borderRadius: "10px",
        background: color,
        color: "white",
        textAlign: "center"
      }}
    >
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}

export default App;