import React, { useEffect, useState, useCallback } from "react";
import Login from "./Login";
import Layout from "./components/Layout";
import AptitudeTest from "./AptitudeTest";

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

function App({ darkMode, toggleDarkMode }) {

  const API = "https://placement-intelligence-system-qdov.onrender.com";

  // ================= AUTH =================
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // ================= STATES =================
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cgpa, setCgpa] = useState("");
  const [aptitude, setAptitude] = useState("");
  const [coding, setCoding] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // ================= FETCH USERS =================
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

  // ================= ADD / EDIT =================
  const handleAddStudent = async () => {

    if (!name || !email || !cgpa || !aptitude || !coding) {
      alert("Fill all fields");
      return;
    }

    try {

      if (editingUser) {

        await fetch(`${API}/update-score/${editingUser}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({
            aptitudeScore: Number(aptitude),
            codingScore: Number(coding)
          })
        });

        setEditingUser(null);

      } else {

        await fetch(`${API}/create-student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({
            name,
            email,
            password: password || "123456",
            cgpa: Number(cgpa),
            aptitudeScore: Number(aptitude),
            codingScore: Number(coding)
          })
        });

      }

      setName("");
      setEmail("");
      setPassword("");
      setCgpa("");
      setAptitude("");
      setCoding("");

      fetchUsers();

    } catch (err) {
      console.log(err);
    }

  };

  // ================= DELETE =================
  const handleDelete = async (id) => {

    try {

      await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });

      fetchUsers();

    } catch (err) {
      console.log(err);
    }

  };

  const handleEdit = (user) => {

    setEditingUser(user._id);
    setName(user.name);
    setEmail(user.email);
    setCgpa(user.cgpa);
    setAptitude(user.aptitudeScore);
    setCoding(user.codingScore);

  };

  // ================= FILTER =================
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

  const getProbability = (score) => {

    if (!score) return 0;

    return Math.min(score, 100);

  };

  // ================= LOGIN PROTECTION =================
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (

    <Layout>

      <Box sx={{ padding: 3 }}>

        {/* TOP BUTTONS */}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>

          <Button variant="contained" onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>

        </Box>

        <Typography variant="h4" sx={{ mb: 3 }}>
          🚀 Placement Intelligence Dashboard
        </Typography>

        {/* DASHBOARD */}

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

        {/* ADD STUDENT */}

        {role === "admin" && (

          <Card sx={{ mb: 4 }}>
            <CardContent>

              <Typography variant="h6" sx={{ mb: 2 }}>
                {editingUser ? "Edit Student" : "Add Student"}
              </Typography>

              <Grid container spacing={2}>

                {[
                  { label: "Name", value: name, set: setName },
                  { label: "Email", value: email, set: setEmail },
                  { label: "Password", value: password, set: setPassword },
                  { label: "CGPA", value: cgpa, set: setCgpa },
                  { label: "Aptitude", value: aptitude, set: setAptitude },
                  { label: "Coding", value: coding, set: setCoding }
                ].map((field, i) => (

                  <Grid item xs={12} md={2} key={i}>

                    <TextField
                      fullWidth
                      label={field.label}
                      value={field.value}
                      onChange={(e) =>
                        field.set(e.target.value)
                      }
                    />

                  </Grid>

                ))}

                <Grid item xs={12} md={2}>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAddStudent}
                  >
                    {editingUser ? "Update" : "Add"}
                  </Button>

                </Grid>

              </Grid>

            </CardContent>
          </Card>

        )}

        {/* SEARCH */}

        <Card sx={{ mb: 3 }}>
          <CardContent>

            <Grid container spacing={2}>

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  label="Search by Name"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </Grid>

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  select
                  label="Filter by Category"
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

        {/* STUDENTS */}

        <Grid container spacing={3}>

          {filteredUsers.map((user) => (

            <Grid item xs={12} md={6} key={user._id}>

              <Card>

                <CardContent>

                  <Typography variant="h6">
                    {user.name}
                  </Typography>

                  <Typography>
                    Email: {user.email}
                  </Typography>

                  <Typography>
                    CGPA: {user.cgpa}
                  </Typography>

                  <Typography>
                    Placement Score: {user.placementScore?.toFixed(2)}
                  </Typography>

                  {/* Probability Bar */}

                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body2">
                      Placement Probability
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={getProbability(user.placementScore)}
                    />
                  </Box>

                  <Typography sx={{ mb: 2 }}>
                    {getRecommendation(user.placementScore)}
                  </Typography>

                  {role === "admin" && (

                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>

                      <Button
                        variant="outlined"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </Button>

                    </Box>

                  )}

                  <Button
                    variant="outlined"
                    onClick={() =>
                      setSelectedUser(user._id)
                    }
                  >
                    Start Aptitude Test
                  </Button>

                  {selectedUser === user._id && (

                    <AptitudeTest
                      userId={user._id}
                      onFinish={() => {
                        setSelectedUser(null);
                        fetchUsers();
                      }}
                    />

                  )}

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