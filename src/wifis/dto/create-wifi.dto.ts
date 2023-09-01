import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWifiDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: `Neighbor's Wifi`,
    description: `Unique wifi title`,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'SantaClaus_5_0',
    description: `Wifi's username`,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '12345678',
    description: `Wifi's Password`,
  })
  password: string;
}
