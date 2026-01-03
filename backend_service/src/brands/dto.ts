import { IsNotEmpty, IsString } from "class-validator";

export class CreateBrandDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;
}