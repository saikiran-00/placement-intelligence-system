import React, { useState } from "react";
import { Box, TextField, Button, Typography, Card, CardContent } from "@mui/material";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "admin@gmail.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1976d2, #42a5f5)"
      }}
    >
      <Card sx={{ width: 350, padding: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ marginBottom: 3, textAlign: "center" }}>
            Placement Intelligence Login
          </Typography>

          <TextField
            fullWidth
            label="Email"
            sx={{ marginBottom: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            sx={{ marginBottom: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button fullWidth variant="contained" onClick={handleLogin}>
            Login
          </Button>
          <Button
  fullWidth
  variant="text"
  sx={{ marginTop: 1 }}
  onClick={() => {
    localStorage.setItem("isLoggedIn", "true");
    onLogin();
  }}
>
  Skip Login
</Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;