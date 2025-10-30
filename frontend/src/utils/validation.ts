import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
});

export const registerSchema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
  firstName: yup
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .required("Tên là bắt buộc"),
  lastName: yup
    .string()
    .min(2, "Họ phải có ít nhất 2 ký tự")
    .required("Họ là bắt buộc"),
});

export const verifyEmailSchema = yup.object({
  token: yup.string().required("Token xác thực là bắt buộc"),
});

export const verifyPhoneSchema = yup.object({
  code: yup
    .string()
    .length(6, "Mã xác thực phải có 6 chữ số")
    .matches(/^\d{6}$/, "Mã xác thực chỉ được chứa số")
    .required("Mã xác thực là bắt buộc"),
});

export const createChatSchema = yup.object({
  name: yup
    .string()
    .min(1, "Tên chat không được để trống")
    .max(50, "Tên chat không được quá 50 ký tự")
    .required("Tên chat là bắt buộc"),
  participants: yup
    .array()
    .of(yup.string())
    .min(1, "Phải có ít nhất 1 người tham gia")
    .required("Danh sách người tham gia là bắt buộc"),
  isGroup: yup.boolean().optional(),
});

export const sendMessageSchema = yup.object({
  content: yup
    .string()
    .min(1, "Nội dung tin nhắn không được để trống")
    .max(1000, "Nội dung tin nhắn không được quá 1000 ký tự")
    .required("Nội dung tin nhắn là bắt buộc"),
  type: yup.string().oneOf(["text", "image", "voice", "file"]).optional(),
});

export const searchMessagesSchema = yup.object({
  query: yup
    .string()
    .min(1, "Từ khóa tìm kiếm không được để trống")
    .max(100, "Từ khóa tìm kiếm không được quá 100 ký tự")
    .required("Từ khóa tìm kiếm là bắt buộc"),
  chatId: yup.string().optional(),
  type: yup.string().oneOf(["text", "image", "voice", "file"]).optional(),
  limit: yup
    .number()
    .min(1, "Giới hạn phải lớn hơn 0")
    .max(100, "Giới hạn không được quá 100")
    .optional(),
  offset: yup.number().min(0, "Offset phải lớn hơn hoặc bằng 0").optional(),
});
