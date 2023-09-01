import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserVerificationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Str0nG!P4szwuRd',
    description: 'Password confirmation',
  })
  password: string;
}
