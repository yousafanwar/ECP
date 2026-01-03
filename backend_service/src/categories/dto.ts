import { IsNotEmpty, IsString, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;
}