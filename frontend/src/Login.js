import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

const API = "https://placement-intelligence-system-qdov.onrender.com";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register | reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ================= LOGIN =================
  const handleLogin = async () => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
    } else {
      alert(data.message);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        cgpa: 0,
        aptitudeScore: 0,
        codingScore: 0
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Account created! Please login.");
      setMode("login");
    } else {
      alert(data.message);
    }
  };

  // ================= RESET =================
  const handleReset = async () => {
    const res = await fetch(`${API}/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        newPassword: password
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password updated! Please login.");
      setMode("login");
    } else {
      alert(data.message);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "100px auto", padding: 3 }}>
      <CardContent>

        <Typography variant="h5" sx={{ mb: 2 }}>
          {mode === "login" && "Login"}
          {mode === "register" && "Create Account"}
          {mode === "reset" && "Reset Password"}
        </Typography>

        {mode === "register" && (
          <TextField
            fullWidth
            label="Name"
            sx={{ mb: 2 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <TextField
          fullWidth
          label="Email"
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label={mode === "reset" ? "New Password" : "Password"}
          type="password"
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === "login" && (
          <Button fullWidth variant="contained" onClick={handleLogin}>
            Login
          </Button>
        )}

        {mode === "register" && (
          <Button fullWidth variant="contained" onClick={handleRegister}>
            Create Account
          </Button>
        )}

        {mode === "reset" && (
          <Button fullWidth variant="contained" onClick={handleReset}>
            Reset Password
          </Button>
        )}

        <Box sx={{ mt: 2, textAlign: "center" }}>
          {mode === "login" && (
            <>
              <Button size="small" onClick={() => setMode("register")}>
                Create Account
              </Button>
              <Button size="small" onClick={() => setMode("reset")}>
                Forgot Password?
              </Button>
            </>
          )}

          {(mode === "register" || mode === "reset") && (
            <Button size="small" onClick={() => setMode("login")}>
              Back to Login
            </Button>
          )}
        </Box>

      </CardContent>
    </Card>
  );
}

export default Login;