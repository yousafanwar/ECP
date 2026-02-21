import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.user_id, email: email, name: user.first_name };

        return {
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(email: string, password: string, firstName: string, lastName: string) {
        const hashed = await bcrypt.hash(password, 10);
        return this.usersService.createUser({ email, password: hashed, firstName, lastName });
    }
}