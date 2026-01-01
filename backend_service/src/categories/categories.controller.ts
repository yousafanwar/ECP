import { Get, Post, Body, Controller, BadRequestException, InternalServerErrorException, Param } from "@nestjs/common";
import { CategoriesService } from "./categories.service";

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async getAllProducts() {
        try {
            const response = await this.categoriesService.fetchAllProducts();
            return { success: true, message: 'Categories retrieved successfully', payload: response };
        } catch (err) {
            throw new InternalServerErrorException('Something went wrong while fetching the categories')
        }
    }


}