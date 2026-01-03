import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { FetchUser } from './interface';
import { createNewUserDTO } from './dto';

@Injectable()
export class UsersService {

    constructor(private readonly pool: DbService) { }

    async getAllUsers(): Promise<FetchUser[]> {
        let response = await this.pool.dbPool().query('select * from users');
        if (response.rows.length === 0) {
            throw new NotFoundException("No users found");
        }
        return response.rows;
    };

    async getIndUser(userId): Promise<FetchUser> {
        let response = await this.pool.dbPool().query(`SELECT user_id, first_name, last_name, email, is_deleted, created_at, updated_at FROM public.users where user_id = $1;`, [userId]);
        if (response.rows.length === 0) {
            throw new NotFoundException(`No user found with the id: ${userId}`);
        }
        return response.rows[0];
    }

    async addUser(userData: createNewUserDTO) {
        try {
            let response = await this.pool.dbPool().query(`INSERT INTO public.users (first_name, last_name, email, "password") VALUES($1, $2, $3, $4) returning user_id, first_name, last_name, email;`, [userData.first_name, userData.last_name, userData.email, userData.password]);
            console.log('create user response', response);
            return response.rows[0].user_id;
        } catch (err) {
            if (err.code === '23505') {
                throw new ConflictException('Email already exists');
            }
            throw err;
        }
    };
}
