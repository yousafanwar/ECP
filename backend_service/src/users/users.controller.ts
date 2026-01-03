import { Body, Controller, Get, Param, Post } from '@nestjs/common';
//import type { User } from 'src/interfaces';
import { UsersService } from './users.service';
//import { ConfigService } from '@nestjs/config';
import { FetchUser } from './interface';
import { createNewUserDTO } from './dto';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
    ) { };

    @Get()
    getAllUsers(): Promise<FetchUser[]> {
        return this.userService.getAllUsers();
    }

    @Get(':id')
    getIntUser(@Param('id') userId: string): Promise<FetchUser> {
        return this.userService.getIndUser(userId);
    }

    @Post()
    createNewUser(@Body() userData: createNewUserDTO) {
        return this.userService.addUser(userData);
    }
}
