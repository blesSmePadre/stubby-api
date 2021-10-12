import { IsString, IsEmail, Length } from 'class-validator';

export class VerifyUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @Length(6)
  confirmationCode: string;
}
