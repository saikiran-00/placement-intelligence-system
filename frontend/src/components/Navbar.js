import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Placement Intelligence System
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;