import { IsString, MinLength } from 'class-validator';

export class UpdateSessionTitleDto {
  @IsString()
  @MinLength(1)
  title: string;
}
