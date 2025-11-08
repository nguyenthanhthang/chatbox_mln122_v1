import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi server nội bộ';

    // Handle HttpException (NestJS standard)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || exception.message;
    }
    // Handle multer errors (file upload)
    else if ((exception as any)?.code === 'LIMIT_FILE_SIZE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'File quá lớn. Kích thước tối đa là 5MB.';
    } else if ((exception as any)?.code === 'LIMIT_UNEXPECTED_FILE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'File không hợp lệ.';
    } else if ((exception as any)?.message) {
      // Handle other errors with message
      const errorMessage = (exception as any).message;
      
      // Check if it's a multer fileFilter error
      if (
        errorMessage.includes('Chỉ chấp nhận file ảnh') ||
        errorMessage.includes('SVG files không được hỗ trợ')
      ) {
        status = HttpStatus.BAD_REQUEST;
        message = errorMessage;
      } else {
        message = errorMessage;
      }
    }

    // Log error for debugging
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Internal server error:', exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}



