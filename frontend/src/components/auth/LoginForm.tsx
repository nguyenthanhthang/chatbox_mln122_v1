import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Typography, Alert, Link, Paper, Container, Divider, IconButton, InputAdornment, keyframes } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff, Email, Lock, Login as LoginIcon } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema } from "../../utils/validation";
import { Button, Input } from "../common";
import { toastSuccess, toastError } from "../../utils/toast";

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      await login(data);
      toastSuccess("Đăng nhập thành công");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toastError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            backgroundSize: "200% 200%",
            animation: `${gradientShift} 8s ease infinite, ${fadeIn} 0.8s ease-out`,
            p: 0.5,
          }}
        >
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2.5,
              p: 4,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4, animation: `${fadeInUp} 0.6s ease-out` }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                  mb: 2,
                  animation: `${pulse} 2s ease-in-out infinite`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    animation: `${rotate} 1s linear infinite`,
                  },
                }}
              >
                <LoginIcon sx={{ fontSize: 32, color: "#fff" }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                sx={{
                  background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Chatbot Triết Học
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Đăng nhập để khám phá trí tuệ
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ animation: `${fadeInUp} 0.8s ease-out` }}>
              <Box sx={{ mb: 3 }}>
                <Input
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#FF6B6B",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FF6B6B",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Input
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="current-password"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#FF6B6B",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FF6B6B",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ textAlign: "right", mb: 3 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  sx={{
                    fontSize: "0.875rem",
                    color: "#FF6B6B",
                    fontWeight: 500,
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                loading={isLoading}
                loadingText="Đang đăng nhập..."
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #E85A5A 0%, #FFC93D 100%)",
                    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.6)",
                  },
                }}
              >
                Đăng nhập
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                hoặc
              </Typography>
            </Divider>

            {/* Register Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                  sx={{
                    color: "#FF6B6B",
                    fontWeight: 600,
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginForm;