import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { AuthProvider, ChatProvider, ThemeProvider } from "./context";
import { Login, Register, VerifyEmail, VerifyPhone } from "./pages/auth";
import { PartyInfo } from "./pages/info";
import ChatInterface from "./components/chat/ChatInterface";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAutoLogout } from "./hooks/useAutoLogout";

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PartyInfo />} />
        <Route path="/info" element={<PartyInfo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatWithAutoLogout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

/** Chỉ chạy useAutoLogout khi đã đăng nhập và ở trang chat */
const ChatWithAutoLogout: React.FC = () => {
  useAutoLogout(30, 5);
  return <ChatInterface />;
};

const muiTheme = createTheme();

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
