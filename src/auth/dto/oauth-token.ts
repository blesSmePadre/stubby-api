import { IsString, IsNotEmpty } from 'class-validator';

export class OAuthToken {
  @IsString()
  @IsNotEmpty()
  token: string;
}
