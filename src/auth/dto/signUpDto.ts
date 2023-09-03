import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'email@email.com',
    description: 'Valid email',
  })
  email: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 10,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  @ApiProperty({
    example: 'Str0nG!P4szwuRd',
    description: `Valid password must be 10 characters long, 
    contain 1 number, 1 lowercase, 1 uppercase and 1 symbol`,
  })
  password: string;
}
