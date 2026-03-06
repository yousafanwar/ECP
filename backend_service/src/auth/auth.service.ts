import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    private generateRefreshToken(): string {
        return randomBytes(32).toString('hex');
    }

    async login(email: string, password: string) {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid email');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid password');

        const payload = { sub: user.user_id, email: email, name: user.first_name };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        // Generate refresh token
        const refreshToken = this.generateRefreshToken();
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Store hashed refresh token in database
        await this.usersService.storeRefreshToken(user.user_id, refreshTokenHash, expiresAt);

        return {
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refresh(userId: string, refreshToken: string) {
        // Validate refresh token exists in database and hasn't expired/been revoked
        const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);
        
        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.usersService.getUserById(userId);
        const payload = { sub: user.user_id, email: user.email, name: user.first_name };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m', // 15 minutes
        });

        return {
            access_token: accessToken,
        };
    }

    async register(email: string, password: string, firstName: string, lastName: string) {
        const hashed = await bcrypt.hash(password, 10);
        return this.usersService.createUser({ email, password: hashed, firstName, lastName });
    }

    async revokeUserTokens(userId: string): Promise<void> {
        await this.usersService.revokeAllTokens(userId);
    }
}