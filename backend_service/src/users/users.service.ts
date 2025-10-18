import { Body, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UsersService {

    constructor(private readonly pool: DbService) { }

    async getAllUsers() {
        let response = await this.pool.dbPool().query('select * from users');
        return response.rows;
    }

    async addUser(@Body() userData: { first_name: string, last_name: string, email: string, "password": string, is_deleted: boolean }) {
        let response = await this.pool.dbPool().query(`INSERT INTO public.users (first_name, last_name, email, "password", is_deleted) VALUES($1, $2, $3, $4, $5) returning *;`, [userData.first_name, userData.last_name, userData.email, userData.password, userData.is_deleted]);
        return response.rows[0].user_id;
    };

}
