import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Typography, Alert, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema } from "../../utils/validation";
import { Button, Input } from "../common";
import { toastSuccess, toastError } from "../../utils/toast";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>("");

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
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      data-1p-ignore="true"
      data-lpignore="true"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 400,
        mx: "auto",
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Đăng nhập
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
        autoComplete="email"
      />

      <Input
        label="Mật khẩu"
        type="password"
        showPasswordToggle
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isLoading}
        loadingText="Đang đăng nhập..."
      >
        Đăng nhập
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          Chưa có tài khoản?{" "}
          <Link component={RouterLink} to="/register">
            Đăng ký ngay
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
