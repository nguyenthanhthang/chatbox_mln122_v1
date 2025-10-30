import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Typography, Alert, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { registerSchema } from "../../utils/validation";
import { Button, Input } from "../common";
import { toastSuccess, toastError } from "../../utils/toast";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
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
    resolver: yupResolver(registerSchema) as any,
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      setSuccess("");

      const { confirmPassword, ...rest } = data;
      await registerUser({
        email: rest.email,
        password: rest.password,
        firstName: rest.firstName,
        lastName: rest.lastName,
      });

      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
      toastSuccess("Đăng ký thành công");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      toastError(err.message || "Đăng ký thất bại");
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
        helperText={errors.email?.message || "Ví dụ: name@example.com"}
        placeholder="name@example.com"
        autoComplete="email"
      />

      <Input
        label="Tên"
        type="text"
        {...register("firstName")}
        error={!!errors.firstName}
        helperText={errors.firstName?.message || "Ít nhất 2 ký tự"}
        placeholder="Ví dụ: An"
        autoComplete="given-name"
      />

      <Input
        label="Họ"
        type="text"
        {...register("lastName")}
        error={!!errors.lastName}
        helperText={errors.lastName?.message || "Ít nhất 2 ký tự"}
        placeholder="Ví dụ: Nguyễn"
        autoComplete="family-name"
      />

      <Input
        label="Mật khẩu"
        type="password"
        showPasswordToggle
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message || "Tối thiểu 6 ký tự"}
        placeholder="Ít nhất 6 ký tự"
        autoComplete="new-password"
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        showPasswordToggle
        {...register("confirmPassword")}
        error={!!errors.confirmPassword}
        helperText={
          errors.confirmPassword?.message || "Nhập lại giống mật khẩu ở trên"
        }
        placeholder="Nhập lại mật khẩu"
        autoComplete="new-password"
      />

      {/* Số điện thoại không yêu cầu theo BE */}

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
