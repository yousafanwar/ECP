import { ParseUUIDPipe } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean, IsEmail, IsStrongPassword, IsUUID, IsEnum } from 'class-validator';

export class createNewUserDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword()
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

}

export enum AddressType {
    Billing = 'billing',
    Shipping = 'shipping',
    Both = 'both'
}

export class createNewAddressDTO {
    @IsNotEmpty()
    @IsString()
    street: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsEnum(AddressType)
    type: AddressType;
}

export class updateAddressDTO {

    @IsNotEmpty()
    @IsString()
    street: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsEnum(AddressType)
    type: AddressType;
}

