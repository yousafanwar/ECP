import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { FetchUserById, FetchUserByEmail } from './interface';
import { createNewUserDTO, createNewAddressDTO, updateAddressDTO } from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

    constructor(private readonly pool: DbService) { }

    async getAllUsers(): Promise<FetchUserById[]> {
        let response = await this.pool.dbPool().query('select * from users');
        if (response.rows.length === 0) {
            throw new NotFoundException("No users found");
        }
        return response.rows;
    };

    async getUserById(userId: string): Promise<FetchUserById> {
        let response = await this.pool.dbPool().query('SELECT user_id, first_name, last_name, email, is_deleted, created_at, updated_at FROM public.users where user_id = $1;', [userId]);
        if (response.rows.length === 0) {
            throw new NotFoundException(`No user found with the id: ${userId}`);
        }
        return response.rows[0];
    }

    async getUserByEmail(email: string): Promise<FetchUserByEmail> {
        let response = await this.pool.dbPool().query('SELECT user_id, first_name, last_name, "password", is_deleted, created_at, updated_at FROM public.users where email=$1;', [email]);
        if (response.rows.length === 0) {
            throw new NotFoundException(`No user found with the email: ${email}`);
        }
        return response.rows[0];
    }

    async createUser(userData: createNewUserDTO) {
        try {
            let response = await this.pool.dbPool().query(`INSERT INTO public.users (first_name, last_name, email, "password") VALUES($1, $2, $3, $4) returning user_id, first_name, last_name, email;`, [userData.firstName, userData.lastName, userData.email, userData.password]);
            console.log('create user response', response);
            return {
                message: 'User created successfully',
                userId: response.rows[0].user_id,
                user: response.rows[0],
            };
        } catch (err) {
            if (err.code === '23505') {
                throw new ConflictException('Email already exists');
            }
            throw err;
        }
    };

    // for the time being user would only be able to add one address later need to add db level enforcement as well
    async addAddress(userId: string, data: createNewAddressDTO) {
        await this.getUserById(userId);
        const findAddress = await this.pool.dbPool().query('SELECT address_id from public.address WHERE user_id=$1;', [userId]);
        if (findAddress.rows.length > 0) {
            throw new ConflictException("User already have an address, try editing it instead");
        }
        const response = await this.pool.dbPool().query(`INSERT INTO public.address (user_id, street, city, state, country, "type") VALUES($1, $2, $3, $4, $5, $6) Returning *;`, [userId, data.street, data.city, data.state, data.country, data.type]);
        const result = response.rows[0];
        console.log('Add address result', result);
        return result;
    }

    async updateUserAddress(userId: string, data: updateAddressDTO) {
        await this.getUserById(userId);
        
        // Check if address exists for this user
        const findAddress = await this.pool.dbPool().query(
            'SELECT address_id FROM public.address WHERE user_id = $1;',
            [userId]
        );

        if (findAddress.rows.length === 0) {
            // No address exists >>> INSERT
            const response = await this.pool.dbPool().query(
                `INSERT INTO public.address (user_id, street, city, state, country, "type") 
                 VALUES($1, $2, $3, $4, $5, $6) 
                 RETURNING *;`,
                [userId, data.street, data.city, data.state, data.country, data.type]
            );
            console.log('Address created:', response.rows[0]);
            return response.rows[0];
        } else {
            // Address exists >>> UPDATE
            const response = await this.pool.dbPool().query(
                `UPDATE public.address 
                 SET street=$1, city=$2, state=$3, country=$4, "type"=$5, updated_at=CURRENT_TIMESTAMP 
                 WHERE user_id=$6 
                 RETURNING *;`,
                [data.street, data.city, data.state, data.country, data.type, userId]
            );
            console.log('Address updated:', response.rows[0]);
            
            if (response.rows.length === 0) {
                throw new NotFoundException("Failed to update address");
            }
            return response.rows[0];
        }
    }

    async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.pool.dbPool().query(
            `INSERT INTO public.refresh_tokens (user_id, token_hash, expires_at) VALUES($1, $2, $3)`,
            [userId, tokenHash, expiresAt],
        );
    }

    async validateRefreshToken(userId: string, tokenHash: string): Promise<boolean> {
        const response = await this.pool.dbPool().query(
            `SELECT token_hash FROM public.refresh_tokens WHERE user_id=$1 AND is_revoked=false AND expires_at > NOW()`,
            [userId],
        );
        
        if (response.rows.length === 0) {
            return false;
        }

        // Compare the incoming token with the stored hash using bcryptjs
        const storedHash = response.rows[0].token_hash;
        return await bcrypt.compare(tokenHash, storedHash);
    }

    async revokeRefreshToken(userId: string): Promise<void> {
        await this.pool.dbPool().query(
            `UPDATE public.refresh_tokens SET is_revoked=true, updated_at=CURRENT_TIMESTAMP WHERE user_id=$1`,
            [userId],
        );
    }

    async revokeAllTokens(userId: string): Promise<void> {
        await this.pool.dbPool().query(
            `UPDATE public.refresh_tokens SET is_revoked=true, updated_at=CURRENT_TIMESTAMP WHERE user_id=$1`,
            [userId],
        );
    }
}
