import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Typography, Alert, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { registerSchema } from "../../utils/validation";
import { Button, Input } from "../common";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phoneNumber?: string;
}

const RegisterForm: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      setSuccess("");

      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);

      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
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
        Đăng ký
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {success && <Alert severity="success">{success}</Alert>}

      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
        autoComplete="email"
      />

      <Input
        label="Tên người dùng"
        type="text"
        {...register("username")}
        error={!!errors.username}
        helperText={errors.username?.message}
        autoComplete="username"
      />

      <Input
        label="Mật khẩu"
        type="password"
        showPasswordToggle
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        showPasswordToggle
        {...register("confirmPassword")}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      <Input
        label="Số điện thoại (tùy chọn)"
        type="tel"
        {...register("phoneNumber")}
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber?.message}
        autoComplete="tel"
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isLoading}
        loadingText="Đang đăng ký..."
      >
        Đăng ký
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          Đã có tài khoản?{" "}
          <Link component={RouterLink} to="/login">
            Đăng nhập ngay
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
