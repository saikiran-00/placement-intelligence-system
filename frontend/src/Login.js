import React, { useState } from "react";
import { Card, CardContent, TextField, Button, Typography } from "@mui/material";

const API = "https://placement-intelligence-system-qdov.onrender.com";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("isLoggedIn", "true");

        onLogin();
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "100px auto", padding: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          🔐 Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button fullWidth variant="contained" onClick={handleLogin}>
          Login
        </Button>
      </CardContent>
    </Card>
  );
}

export default Login;