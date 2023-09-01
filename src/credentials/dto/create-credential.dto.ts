import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My credential',
    description: 'Unique credential title',
  })
  title: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    example: 'https://www.google.com',
    description: 'Valid url',
  })
  url: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'my-username',
    description: 'Valid username',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Str0nG!P4szwuRd',
    description: 'Valid password',
  })
  password: string;
}
