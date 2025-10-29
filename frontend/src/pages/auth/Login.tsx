import React from "react";
import { Container, Paper, Box } from "@mui/material";
import { LoginForm } from "../../components/auth";

const Login: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
