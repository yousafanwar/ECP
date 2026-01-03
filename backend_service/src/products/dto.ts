import { IsNotEmpty, IsString, MaxLength, IsUUID, IsBoolean, IsNumber } from 'class-validator';

export class AddProductDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    sku: number;

    @IsNumber()
    @IsNotEmpty()
    stock_quantity: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsNotEmpty()
    category_id: string;

    @IsUUID()
    @IsNotEmpty()
    brand_id: string;

    @IsString()
    @IsNotEmpty()
    image_url: string;

    @IsBoolean()
    is_hero: boolean
}