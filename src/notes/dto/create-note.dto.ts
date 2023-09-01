import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My note',
    description: 'Unique note title',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    description: 'Note text',
  })
  text: string;
}
