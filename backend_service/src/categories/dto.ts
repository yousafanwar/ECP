import { IsNotEmpty, IsString, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}