import React from "react";
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface InputProps extends Omit<TextFieldProps, "type"> {
  type?: "text" | "email" | "password" | "number" | "tel";
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  // Thêm attributes để giảm thiểu password manager warnings
  const inputProps = type === "password" ? {
    ...props.inputProps,
    "data-1p-ignore": "true", // Bỏ qua 1Password
    "data-lpignore": "true", // Bỏ qua LastPass
  } : props.inputProps;

  return (
    <TextField
      type={inputType}
      fullWidth
      variant="outlined"
      {...props}
      inputProps={inputProps}
      InputProps={{
        ...props.InputProps,
        endAdornment:
          type === "password" && showPasswordToggle ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : (
            props.InputProps?.endAdornment
          ),
      }}
    />
  );
};

export default Input;
