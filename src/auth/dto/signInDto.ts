import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'email@email.com',
    description: 'Valid email',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Str0nG!P4szwuRd',
    description: 'Valid password',
  })
  password: string;
}
