import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBase64OrDataUrl', async: false })
export class IsBase64OrDataUrlConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string' || !value) {
      return true; // Optional field, skip if empty
    }

    // Strip data URL prefix if present (data:image/jpeg;base64,)
    const base64Only = value.replace(/^data:[^;]+;base64,/, '');

    // Validate base64 string (only contains base64 characters)
    // Base64 can contain: A-Z, a-z, 0-9, +, /, = (padding)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(base64Only) && base64Only.length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'base64 phải là chuỗi base64 hợp lệ (có thể có prefix data:image/...;base64,)';
  }
}

export function IsBase64OrDataUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBase64OrDataUrlConstraint,
    });
  };
}

