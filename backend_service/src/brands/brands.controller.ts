import { Get, Controller } from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { FetchAllBrands } from "./interface";
import { ApiResponse } from "src/common";

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    async getAllBrands(): Promise<ApiResponse<FetchAllBrands[]>> {
        const response = await this.brandsService.fetchAllBrands();
        return new ApiResponse(true, 'Brands retrieved successfully', response);
    }
}