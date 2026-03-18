import { IsNotEmpty, IsOptional, IsString, IsArray, MaxLength, IsUUID, IsBoolean, IsNumber } from 'class-validator';

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

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsNumber()
    sku?: number;

    @IsOptional()
    @IsNumber()
    stock_quantity?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    category_id?: string;

    @IsOptional()
    @IsUUID()
    brand_id?: string;
}

export class AddProductImagesDTO {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    image_urls: string[];
}