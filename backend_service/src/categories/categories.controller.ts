import { Get, Controller } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { FetchAllCategories } from "./interface";

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async getAllProducts(): Promise<FetchAllCategories[]> {
        const response = await this.categoriesService.fetchAllProducts();
        return response;
    };
};