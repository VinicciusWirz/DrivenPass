import { ApiProperty } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsExpirtaionDate } from '../../decorators/expiration-date.validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My credit card',
    description: 'Unique card title',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '4444111111111111',
    description: 'Card number',
  })
  number: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Vovo Juju',
    description: 'Card printed name',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '111',
    description: 'Card security code',
  })
  cvv: string;

  @IsNotEmpty()
  @IsExpirtaionDate()
  @ApiProperty({
    example: '12/28',
    description: 'Card expiration date MM/YY',
  })
  expiration: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '123456',
    description: 'Card password',
  })
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'If card is a virtual card',
  })
  virtual: boolean;

  @IsNotEmpty()
  @IsEnum(CardType)
  @ApiProperty({
    example: 'BOTH',
    description: 'If card is CREDIT, DEBIT or BOTH',
  })
  type: CardType;
}
