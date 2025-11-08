import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ChatProvider, ThemeProvider } from "./context";
import { Login, Register, VerifyEmail, VerifyPhone } from "./pages/auth";
import ChatInterface from "./components/chat/ChatInterface";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAutoLogout } from "./hooks/useAutoLogout";

const AppContent: React.FC = () => {
  // Tự động logout sau 30 phút không có thao tác
  useAutoLogout(30, 5);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/chat" />} />
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
