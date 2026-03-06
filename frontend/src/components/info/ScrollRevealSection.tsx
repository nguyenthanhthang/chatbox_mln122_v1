import React from "react";
import { Box } from "@mui/material";
import { useScrollReveal } from "../../hooks/useScrollReveal";

type RevealDirection = "up" | "left" | "right";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  direction?: RevealDirection;
}

const getTransform = (isVisible: boolean, direction: RevealDirection) => {
  if (isVisible) return "translate(0, 0)";
  switch (direction) {
    case "left":
      return "translateX(-50px)";
    case "right":
      return "translateX(50px)";
    default:
      return "translateY(40px)";
  }
};

/**
 * Wrapper tạo hiệu ứng trượt khi scroll (up/left/right).
 */
export const ScrollRevealSection: React.FC<ScrollRevealSectionProps> = ({ children, direction = "up" }) => {
  const { ref, isVisible } = useScrollReveal(0.08);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(isVisible, direction),
        transition: "opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {children}
    </Box>
  );
};
