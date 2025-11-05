import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ChatProvider } from "./context";
import { Login, Register, VerifyEmail, VerifyPhone } from "./pages/auth";
import ChatInterface from "./components/chat/ChatInterface";
import ProtectedRoute from "./components/common/ProtectedRoute";

const AppContent: React.FC = () => {
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
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
