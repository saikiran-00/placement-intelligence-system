import React, { useEffect, useState, useCallback } from "react";
import Login from "./Login";
import Layout from "./components/Layout";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  LinearProgress
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function App({ darkMode, toggleDarkMode }) {

  const API = "https://placement-intelligence-system-qdov.onrender.com";

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [completedTasks, setCompletedTasks] = useState({});

  const fetchUsers = useCallback(async () => {

    try {

      const res = await fetch(`${API}/users`, {
        headers: { Authorization: token }
      });

      const data = await res.json();

      if (res.ok) setUsers(data);

    } catch (err) {
      console.log(err);
    }

  }, [API, token]);

  useEffect(() => {
    if (isLoggedIn) fetchUsers();
  }, [isLoggedIn, fetchUsers]);

  const getProbability = (score) => {
    if (!score) return 0;
    return Math.min(score, 100);
  };

  const getChartData = (user) => [
    { name: "CGPA", value: user.cgpa * 10 },
    { name: "Aptitude", value: user.aptitudeScore },
    { name: "Coding", value: user.codingScore },
    { name: "Placement", value: user.placementScore }
  ];

  const getStudyPlan = (user) => {

    if (user.placementScore >= 75) {
      return [
        "Solve 2 Mock Tests",
        "Practice HR Questions",
        "Revise Core Subjects"
      ];
    }

    if (user.placementScore >= 50) {
      return [
        "Practice Aptitude Questions",
        "Solve Coding Problems",
        "Watch DSA Tutorials"
      ];
    }

    return [
      "Learn Basic Aptitude",
      "Practice Beginner Coding",
      "Revise Programming Basics"
    ];
  };

  const toggleTask = (userId, index) => {

    setCompletedTasks((prev) => {

      const userTasks = prev[userId] || [];
      userTasks[index] = !userTasks[index];

      return {
        ...prev,
        [userId]: [...userTasks]
      };

    });

  };

  const filteredUsers = users.filter((user) => {

    const matchSearch =
      user.name?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      filterCategory === "All" || user.category === filterCategory;

    return matchSearch && matchCategory;

  });

  const totalStudents = users.length;

  const readyCount =
    users.filter((u) => u.category === "Placement Ready").length;

  const improveCount =
    users.filter((u) => u.category === "Needs Improvement").length;

  const riskCount =
    users.filter((u) => u.category === "High Risk").length;

  const getRecommendation = (score) => {

    if (!score) return "No Data";

    if (score >= 80) return "🏢 Product Companies";
    if (score >= 60) return "🏢 Service Companies";

    return "📚 Skill Training Required";
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (

    <Layout>

      <Box sx={{ padding: 3 }}>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>

          <Button variant="contained" onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>

        </Box>

        <Typography variant="h4" sx={{ mb: 3 }}>
          🚀 Placement Intelligence Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>

          {[
            { title: "Total Students", value: totalStudents },
            { title: "Placement Ready", value: readyCount },
            { title: "Needs Improvement", value: improveCount },
            { title: "High Risk", value: riskCount }
          ].map((card, i) => (

            <Grid item xs={12} md={3} key={i}>

              <Card>
                <CardContent>

                  <Typography variant="h6">
                    {card.title}
                  </Typography>

                  <Typography variant="h4">
                    {card.value}
                  </Typography>

                </CardContent>
              </Card>

            </Grid>

          ))}

        </Grid>

        <Card sx={{ mb: 3 }}>
          <CardContent>

            <Grid container spacing={2}>

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  label="Search Student"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </Grid>

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  select
                  label="Filter"
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(e.target.value)
                  }
                >

                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Placement Ready">Placement Ready</MenuItem>
                  <MenuItem value="Needs Improvement">Needs Improvement</MenuItem>
                  <MenuItem value="High Risk">High Risk</MenuItem>

                </TextField>

              </Grid>

            </Grid>

          </CardContent>
        </Card>

        <Grid container spacing={3}>

          {filteredUsers.map((user) => (

            <Grid item xs={12} md={6} key={user._id}>

              <Card>

                <CardContent>

                  <Typography variant="h6">
                    {user.name}
                  </Typography>

                  <Typography>Email: {user.email}</Typography>
                  <Typography>CGPA: {user.cgpa}</Typography>

                  <Typography>
                    Placement Score: {user.placementScore?.toFixed(2)}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Placement Probability
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={getProbability(user.placementScore)}
                    />
                  </Box>

                  <Typography sx={{ mt: 1 }}>
                    {getRecommendation(user.placementScore)}
                  </Typography>

                  <BarChart
                    width={320}
                    height={200}
                    data={getChartData(user)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Study Plan
                  </Typography>

                  {getStudyPlan(user).map((task, index) => (

                    <Box key={index} sx={{ display: "flex", gap: 1 }}>

                      <input
                        type="checkbox"
                        checked={completedTasks[user._id]?.[index] || false}
                        onChange={() =>
                          toggleTask(user._id, index)
                        }
                      />

                      <Typography>{task}</Typography>

                    </Box>

                  ))}

                </CardContent>

              </Card>

            </Grid>

          ))}

        </Grid>

      </Box>

    </Layout>
  );
}

export default App;