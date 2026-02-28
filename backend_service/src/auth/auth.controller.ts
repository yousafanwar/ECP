import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() body: { email: string; password: string, firstName: string, lastName: string }) {
    console.log('register method body', body);
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: { userId: string; refresh_token: string }) {
    if (!body.userId || !body.refresh_token) {
      throw new BadRequestException('Missing userId or refresh_token');
    }
    return this.authService.refresh(body.userId, body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: any) {
    // In this simple implementation, logout is handled by the client
    // by deleting the refresh token and clearing tokens from storage
    // For now, we can just return a success message
    return { message: 'Logged out successfully' };
  }
}
