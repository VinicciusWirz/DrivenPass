import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLicenseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Windows 10',
    description: 'Software name',
  })
  softwareName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Pro',
    description: 'Software version',
  })
  softwareVersion: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'abcd-efg1-234h-ij56',
    description: 'License key',
  })
  licenseKey: string;
}
