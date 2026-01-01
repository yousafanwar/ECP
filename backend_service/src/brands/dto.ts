import { IsNotEmpty, IsString, MaxLength, IsUUID, IsOptional } from "class-validator";

export class FetchAllBrandsDTO {
    @IsUUID()
    brand_id: string;

    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    description: string;
}

export class CreateBrandDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;
}