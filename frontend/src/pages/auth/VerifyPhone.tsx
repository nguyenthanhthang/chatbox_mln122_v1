import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Typography, Alert, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input } from "../../components/common";
import * as yup from "yup";

const schema = yup.object({
  code: yup
    .string()
    .required("Mã xác thực là bắt buộc")
    .length(6, "Mã xác thực phải có 6 chữ số")
    .matches(/^\d{6}$/, "Mã xác thực chỉ được chứa số"),
});

interface VerifyPhoneFormData {
  code: string;
}

const VerifyPhone: React.FC = () => {
  const { verifyPhone, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyPhoneFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: VerifyPhoneFormData) => {
    try {
      setError("");
      setSuccess("");

      await verifyPhone(data.code);
      setSuccess("Số điện thoại đã được xác thực thành công!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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
        minHeight: "100vh",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Xác thực số điện thoại
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 2 }}
      >
        Nhập mã xác thực 6 chữ số đã được gửi đến số điện thoại của bạn
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Input
        label="Mã xác thực"
        type="text"
        placeholder="123456"
        {...register("code")}
        error={!!errors.code}
        helperText={errors.code?.message}
        inputProps={{ maxLength: 6 }}
        autoComplete="one-time-code"
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isLoading}
        loadingText="Đang xác thực..."
      >
        Xác thực
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          Không nhận được mã?{" "}
          <Link component={RouterLink} to="/login">
            Quay lại đăng nhập
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default VerifyPhone;
