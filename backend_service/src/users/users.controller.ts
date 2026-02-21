import { Body, Controller, Get, Param, Post, UseGuards, InternalServerErrorException, Put, ParseUUIDPipe } from '@nestjs/common';
//import type { User } from 'src/interfaces';
import { UsersService } from './users.service';
//import { ConfigService } from '@nestjs/config';
import { FetchUserById } from './interface';
import { createNewAddressDTO, createNewUserDTO, updateAddressDTO } from './dto';
import { ApiResponse } from 'src/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
    ) { };

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers(): Promise<ApiResponse<FetchUserById[]>> {
        const response = await this.userService.getAllUsers();
        return new ApiResponse(true, 'Users retrieved successfully', response);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getIndUser(@Param('id', ParseUUIDPipe) userId: string): Promise<ApiResponse<FetchUserById>> {
        const response = await this.userService.getUserById(userId);
        return new ApiResponse(true, 'User retrieved successfully', response);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createNewUser(@Body() userData: createNewUserDTO): Promise<ApiResponse> {
        const response = await this.userService.createUser(userData);
        return new ApiResponse(true, 'User created successfully', response);
    }

    @UseGuards(JwtAuthGuard)
    @Post('create_address/:userId')
    async createAddress(@Param('userId', ParseUUIDPipe) userId: string, @Body() data: createNewAddressDTO): Promise<ApiResponse> {
        const response = await this.userService.addAddress(userId, data);
        return new ApiResponse(true, 'Address added successfuly', response);
    }

    @UseGuards(JwtAuthGuard)
    @Put('updateAddress/:userId')
    async updateAddress(@Param('userId', ParseUUIDPipe) userId: string, @Body() data: updateAddressDTO): Promise<ApiResponse> {
        const response = await this.userService.updateAddress(userId, data);
        return new ApiResponse(true, 'Address updated successfuly', response);
    }

}
