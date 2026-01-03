import { Get, Controller } from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { FetchAllBrands } from "./interface";

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    async getAllBrands(): Promise<FetchAllBrands[]> {
        const response = await this.brandsService.fetchAllBrands();
        return response;
    }
}