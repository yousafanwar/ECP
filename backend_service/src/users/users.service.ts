import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { FetchUser } from './interface';
import { createNewUserDTO, createNewAddressDTO, updateAddressDTO } from './dto';

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

    async getUserById(userId: string): Promise<FetchUser> {
        let response = await this.pool.dbPool().query('SELECT user_id, first_name, last_name, email, is_deleted, created_at, updated_at FROM public.users where user_id = $1;', [userId]);
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

    async updateAddress(userId: string, data: updateAddressDTO) {
        await this.getUserById(userId);
        const response = await this.pool.dbPool().query(`UPDATE public.address SET street=$1, city=$2, state=$3, country=$4, "type"=$5 WHERE user_id=$6 Returning *;`, [data.street, data.city, data.state, data.country, data.type, userId]);
        const result = response.rows[0];
        if (response.rows.length === 0) {
            throw new NotFoundException("No address found for the user")
        }
        return result;
    }
}
