export class LoginResponseDto {
  userId: string;
  firstName: string;
  lastName: string;
  access_token: string;
  refresh_token: string;
}

export class RefreshResponseDto {
  access_token: string;
}

export class LogoutResponseDto {
  message: string;
}

export class GuestSessionResponseDto {
  guest_id: string;
  access_token: string;
}

import { IsString, IsEmail, MinLength } from 'class-validator';

export class ConvertGuestDto {
  @IsString()
  guestId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
