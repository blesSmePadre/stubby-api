import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$/)
  password: string;
}
