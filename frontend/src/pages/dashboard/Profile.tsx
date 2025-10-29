import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box p={3}>
        <Typography color="error">
          Không thể tải thông tin người dùng
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Thông tin cá nhân
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
            <Avatar
              src={user.avatar}
              alt={user.username}
              sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{user.username}</Typography>
            <Chip
              label={user.role}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
              <Chip
                label={user.emailVerification}
                color={
                  user.emailVerification === "verified" ? "success" : "warning"
                }
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {user.phoneNumber && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">{user.phoneNumber}</Typography>
                <Chip
                  label={user.phoneVerification}
                  color={
                    user.phoneVerification === "verified"
                      ? "success"
                      : "warning"
                  }
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Trạng thái tài khoản
              </Typography>
              <Chip
                label={user.isActive ? "Hoạt động" : "Bị khóa"}
                color={user.isActive ? "success" : "error"}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {user.lastLoginAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Lần đăng nhập cuối
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.lastLoginAt)}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tham gia từ
              </Typography>
              <Typography variant="body1">
                {formatDate(user.createdAt)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
