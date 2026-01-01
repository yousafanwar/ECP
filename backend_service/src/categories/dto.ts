import { IsNotEmpty, IsString, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class FetchAllCategoriesDTO {
    @IsUUID()
    category_id: string;
    @IsString()
    @MaxLength(255)
    name: string;
}

export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;
}