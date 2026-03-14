import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException, Res, Req } from '@nestjs/common';
import type { Response } from 'express';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConvertGuestDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() body: { email: string; password: string, firstName: string, lastName: string }) {
    console.log('register method body', body);
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response
  ) {
    const result = await this.authService.login(body.email, body.password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth', // Only send to /auth routes
    });

    // Return only accessToken and user info (not refresh_token)
    return res.json({
      userId: result.userId,
      firstName: result.firstName,
      lastName: result.lastName,
      email: body.email,
      access_token: result.access_token,
    });
  }

  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Body() body: { userId: string },
    @Res() res: Response
  ) {
    const userId = body.userId;
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken || !userId) {
      throw new BadRequestException('Missing userId or refresh token cookie');
    }

    const result = await this.authService.refresh(userId, refreshToken);

    // Optionally set a new refresh token (token rotation)
    // For now, we'll just return the new access token
    
    return res.json({
      access_token: result.access_token,
    });
  }

  @Post('guest')
  async createGuestSession() {
    return this.authService.createGuestSession();
  }

  @Post('guest/convert')
  async convertGuestToUser(
    @Body() body: ConvertGuestDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.convertGuestToUser(
      body.guestId,
      body.email,
      body.password,
      body.firstName,
      body.lastName,
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });

    return res.json({
      userId: result.userId,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      access_token: result.access_token,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any, @Res() res: Response) {
    const userId = req.user.sub; // Extracted from JWT by JwtAuthGuard

    // Revoke all refresh tokens for this user
    if (userId) {
      await this.authService.revokeUserTokens(userId);
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
    });

    return res.json({ message: 'Logged out successfully' });
  }
}

