import { Get, Post, Controller, Body } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { FetchAllCategories } from "./interface";
import { CreateCategoryDTO } from "./dto";
import { ApiResponse } from "src/common";

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async getAllCategories(): Promise<ApiResponse<FetchAllCategories[]>> {
        const response = await this.categoriesService.fetchAllCategories();
        return new ApiResponse(true, 'Categories retrieved successfully', response);
    }

    @Post()
    async createCategory(@Body() createCategoryDTO: CreateCategoryDTO): Promise<ApiResponse<{ category_id: string }>> {
        const response = await this.categoriesService.createCategory(createCategoryDTO);
        return new ApiResponse(true, 'Category created successfully', response);
    }
};