import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const Button: React.FC<ButtonProps> = ({
  loading = false,
  loadingText = "Loading...",
  children,
  disabled,
  ...props
}) => {
  return (
    <MuiButton disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button;
