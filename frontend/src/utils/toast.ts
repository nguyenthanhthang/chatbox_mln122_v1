import { toast, ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, { ...defaultOptions, ...options });

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, { ...defaultOptions, ...options });

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast.info(message, { ...defaultOptions, ...options });

export const toastWarn = (message: string, options?: ToastOptions) =>
  toast.warn(message, { ...defaultOptions, ...options });

const toastUtils = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  warn: toastWarn,
};

export default toastUtils;
