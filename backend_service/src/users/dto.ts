import { IsNotEmpty, IsString, MaxLength, IsBoolean, IsEmail, IsStrongPassword } from 'class-validator';

export class createNewUserDTO {
    @IsNotEmpty()

    @IsString()
    @MaxLength(255)
    first_name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    last_name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword()
    password: string;

}