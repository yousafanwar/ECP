import { Get, Controller } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { FetchAllCategories } from "./interface";
import { ApiResponse } from "src/common";

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async getAllProducts(): Promise<ApiResponse<FetchAllCategories[]>> {
        const response = await this.categoriesService.fetchAllProducts();
        return new ApiResponse(true, 'Categories retrieved successfully', response);
    };
};