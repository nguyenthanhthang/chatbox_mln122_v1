import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Divider,
  Link,
  keyframes,
} from "@mui/material";
import { SmartToy, MenuBook } from "@mui/icons-material";

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
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const flipIn = keyframes`
  from {
    opacity: 0;
    transform: perspective(800px) rotateY(-15deg) translateX(20px);
  }
  to {
    opacity: 1;
    transform: perspective(800px) rotateY(0) translateX(0);
  }
`;

// Nội dung các khối - có thể thay ảnh bằng đường dẫn thực tế
const sections = [
  {
    id: "ii",
    title: "II. Nhà nước xã hội chủ nghĩa",
    content:
      "Nhà nước xã hội chủ nghĩa là nhà nước của Nhân dân, do Nhân dân và vì Nhân dân. Đây là kiểu nhà nước mới, thực hiện quản lý xã hội bằng pháp luật, bảo đảm quyền lợi của Nhân dân và hướng tới mục tiêu phát triển công bằng, tiến bộ.",
    image: "/hinh1.jpg",
    imageLeft: true,
  },
  {
    id: "iii",
    title: "III. Dân chủ xã hội chủ nghĩa và nhà nước pháp quyền xã hội chủ nghĩa ở Việt Nam",
    content:
      "Dân chủ xã hội chủ nghĩa và nhà nước pháp quyền xã hội chủ nghĩa là hai nội dung cốt lõi trong quá trình xây dựng hệ thống chính trị ở Việt Nam. Đây là cơ sở để phát huy quyền làm chủ của Nhân dân và nâng cao hiệu quả quản lý nhà nước.",
    image: "/hinh2.png",
    imageLeft: false,
  },
  {
    id: "1",
    title: "1. Dân chủ xã hội chủ nghĩa ở Việt Nam",
    content:
      "Dân chủ xã hội chủ nghĩa ở Việt Nam là nền dân chủ bảo đảm quyền làm chủ của Nhân dân, gắn với pháp luật, kỷ cương và sự lãnh đạo của Đảng. Nền dân chủ này được thực hiện trong cả đời sống chính trị, kinh tế, văn hóa và xã hội.",
    image: "/hinh3.jpg",
    imageLeft: true,
  },
  {
    id: "2",
    title: "2. Nhà nước pháp quyền xã hội chủ nghĩa ở Việt Nam",
    content:
      "Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam hoạt động trên cơ sở Hiến pháp và pháp luật, bảo đảm mọi quyền lực nhà nước thuộc về Nhân dân. Đây là nền tảng quan trọng để xây dựng xã hội ổn định, công bằng và phát triển.",
    image: "/hinh4.jpg",
    imageLeft: false,
  },
  {
    id: "3",
    title: "3. Phát huy dân chủ xã hội chủ nghĩa, xây dựng Nhà nước pháp quyền xã hội chủ nghĩa ở Việt Nam hiện nay",
    content:
      "Hiện nay, Việt Nam tiếp tục đẩy mạnh phát huy dân chủ, hoàn thiện pháp luật, cải cách hành chính và nâng cao hiệu quả quản lý nhà nước. Đây là yêu cầu quan trọng nhằm xây dựng bộ máy nhà nước trong sạch, vững mạnh và phục vụ Nhân dân tốt hơn.",
    image: "/hinh4.jpg",
    imageLeft: true,
  },
];

const PartyInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f6f3", pb: 6 }}>
      {/* Nút AI VNR - fixed */}
      <Button
        variant="contained"
        startIcon={<SmartToy />}
        onClick={() => navigate("/login")}
        sx={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 1100,
          px: 3,
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
        AI VNR
      </Button>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero - Bìa sách */}
        <Paper
          elevation={8}
          sx={{
            p: 4,
            mb: 6,
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            backgroundSize: "200% 200%",
            animation: `${gradientShift} 8s ease infinite, ${fadeIn} 0.8s ease-out`,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.3)",
                mb: 2,
                animation: `${pulse} 2s ease-in-out infinite`,
                "&:hover": { animation: `${rotate} 1s linear infinite` },
              }}
            >
              <MenuBook sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              sx={{
                color: "#fff",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                mb: 1,
              }}
            >
              Chương 4
            </Typography>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: { xs: "1.1rem", sm: "1.35rem" },
              }}
            >
              Dân chủ xã hội chủ nghĩa và Nhà nước xã hội chủ nghĩa
            </Typography>
          </Box>
        </Paper>

        {/* Các khối nội dung - xen kẽ, kiểu lật sách */}
        {sections.map((section, index) => (
          <Paper
            key={section.id}
            elevation={4}
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column", md: section.imageLeft ? "row" : "row-reverse" },
              animation: `${flipIn} 0.8s ease-out`,
              animationDelay: `${index * 0.1}s`,
              animationFillMode: "both",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                transform: "translateY(-4px)",
              },
            }}
          >
            {/* Ảnh */}
            <Box
              sx={{
                width: { xs: "100%", md: "45%" },
                minHeight: { xs: 220, md: 280 },
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={section.image}
                alt={section.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/600x400/f5f5f5/999?text=Hình+ảnh";
                }}
              />
            </Box>

            {/* Nội dung */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                bgcolor: "#fff",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  mb: 2,
                  background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.primary",
                  lineHeight: 1.9,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                {section.content}
              </Typography>
            </Box>
          </Paper>
        ))}

        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="text.secondary">
            hoặc
          </Typography>
        </Divider>

        {/* CTA */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,217,61,0.08) 100%)",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Có nhu cầu trao đổi, hỏi đáp với AI?
          </Typography>
          <Button
            variant="contained"
            startIcon={<SmartToy />}
            onClick={() => navigate("/login")}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              maxWidth: 400,
              mx: "auto",
              display: "block",
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
              boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #E85A5A 0%, #FFC93D 100%)",
                boxShadow: "0 6px 20px rgba(255, 107, 107, 0.6)",
              },
            }}
          >
            Đăng nhập để dùng AI VNR
          </Button>
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{" "}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                sx={{ color: "#FF6B6B", fontWeight: 600 }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PartyInfo;
