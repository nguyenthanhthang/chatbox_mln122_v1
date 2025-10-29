import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token xác thực không hợp lệ");
      return;
    }

    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Email đã được xác thực thành công!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Xác thực email thất bại");
      }
    };

    verifyEmailToken();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Đang xác thực email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng chờ trong giây lát
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Bạn sẽ được chuyển hướng đến trang đăng nhập...
            </Typography>
          </>
        )}

        {status === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Vui lòng thử lại hoặc liên hệ hỗ trợ
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmail;
