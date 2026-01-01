import { Get, Post, Body, Controller, BadRequestException, InternalServerErrorException, Param } from "@nestjs/common";
import { BrandsService } from "./brands.service";

@Controller('brands')
export class BrandsController{
    constructor(private readonly brandsService : BrandsService){}

    @Get()
    async getAllBrands(){
        try{
            const response = await this.brandsService.fetchAllBrands();
            return { success: true, message: 'Brands retrieved successfully', payload: response };
        }catch(err){
            throw new InternalServerErrorException('Something went wrong while fetching the brands');
        }
    }
}