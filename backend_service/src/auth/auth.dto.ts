import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class LoginResponseDto {
  userId!: string;
  firstName!: string;
  lastName!: string;
  access_token!: string;
  refresh_token!: string;
}

export class RefreshResponseDto {
  access_token!: string;
}

export class LogoutResponseDto {
  message!: string;
}

export class GuestSessionResponseDto {
  guest_id!: string;
  access_token!: string;
}

/** E.164-style full number including + and country code (10–15 digits after +). */
const PHONE_E164_REGEX = /^\+[1-9]\d{9,14}$/;

export class RegisterDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @Matches(PHONE_E164_REGEX, { message: 'Invalid phone number' })
  phone!: string;
}

export class ConvertGuestDto {
  @IsString()
  guestId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @Matches(PHONE_E164_REGEX, { message: 'Invalid phone number' })
  phone!: string;
}
