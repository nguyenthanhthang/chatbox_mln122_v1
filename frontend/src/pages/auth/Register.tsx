import React from "react";
import { Container, Paper, Box } from "@mui/material";
import { RegisterForm } from "../../components/auth";

const Register: React.FC = () => {
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
          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
