import { Get, Post, Controller, Body } from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { FetchAllBrands } from "./interface";
import { CreateBrandDTO } from "./dto";
import { ApiResponse } from "src/common";

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    async getAllBrands(): Promise<ApiResponse<FetchAllBrands[]>> {
        const response = await this.brandsService.fetchAllBrands();
        return new ApiResponse(true, 'Brands retrieved successfully', response);
    }

    @Post()
    async createBrand(@Body() createBrandDTO: CreateBrandDTO): Promise<ApiResponse<{ brand_id: string }>> {
        const response = await this.brandsService.createBrand(createBrandDTO);
        return new ApiResponse(true, 'Brand created successfully', response);
    }
}