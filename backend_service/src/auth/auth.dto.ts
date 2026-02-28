export class LoginResponseDto {
  userId: string;
  firstName: string;
  lastName: string;
  access_token: string;
  refresh_token: string;

  constructor(
    userId: string,
    firstName: string,
    lastName: string,
    access_token: string,
    refresh_token: string,
  ) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }
}

export class RefreshResponseDto {
  access_token: string;

  constructor(access_token: string) {
    this.access_token = access_token;
  }
}

export class LogoutResponseDto {
  message: string;

  constructor(message: string = 'Logged out successfully') {
    this.message = message;
  }
}
