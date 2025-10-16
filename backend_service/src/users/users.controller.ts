import { Body, Controller, Get, Post } from '@nestjs/common';
//import type { User } from 'src/interfaces';
import { UsersService } from './users.service';
//import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
  //      private configService: ConfigService
    ){};

    @Get()
    getAllUsers(){
        return this.userService.getAllUsers();
    }

    @Post()
    addUser(@Body() userData: {first_name: string, last_name: string, email: string, "password": string, is_deleted: boolean}){
        return this.userService.addUser(userData);
    }

}
