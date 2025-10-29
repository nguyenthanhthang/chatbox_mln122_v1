import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, ChatProvider } from "./context";
import { useAuth } from "./hooks/useAuth";
import { Login, Register, VerifyEmail, VerifyPhone } from "./pages/auth";
import ChatInterface from "./components/chat/ChatInterface";
import { LoadingSpinner } from "./components/common";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Đang xác thực..." />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Đang xác thực..." />;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/chat" />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-phone"
          element={
            <ProtectedRoute>
              <VerifyPhone />
            </ProtectedRoute>
          }
        />
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
