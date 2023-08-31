import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'expirationDate' })
export class ExpirtaionDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments) {
    const regex = /^(0[1-9]|1[0-2])\/(0[0-9]|1[0-9]|2[0-9])$/;
    return regex.test(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Expiration date must be a valid format MM/YY`;
  }
}

export function IsExpirtaionDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ExpirtaionDateConstraint,
    });
  };
}
