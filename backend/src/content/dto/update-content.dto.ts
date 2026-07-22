import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string;
}
