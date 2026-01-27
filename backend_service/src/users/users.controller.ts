import { Body, Controller, Get, Param, Post } from '@nestjs/common';
//import type { User } from 'src/interfaces';
import { UsersService } from './users.service';
//import { ConfigService } from '@nestjs/config';
import { FetchUser } from './interface';
import { createNewUserDTO } from './dto';
import { ApiResponse } from 'src/common';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
    ) { };

    @Get()
    async getAllUsers(): Promise<ApiResponse<FetchUser[]>> {
        const result = await this.userService.getAllUsers();
        return new ApiResponse(true, 'Users retrieved successfully', result);
    }

    @Get(':id')
    async getIntUser(@Param('id') userId: string): Promise<ApiResponse<FetchUser>> {
        const result = await this.userService.getIndUser(userId);
        return new ApiResponse(true, 'User retrieved successfully', result);
    }

    @Post()
    async createNewUser(@Body() userData: createNewUserDTO): Promise<ApiResponse> {
        const result = await this.userService.addUser(userData);
        return new ApiResponse(true, 'User created successfully', result);
    }
}
