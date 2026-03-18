import { Get, Post, Put, Body, Controller, Param, ParseUUIDPipe } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { AddProductDTO, UpdateProductDTO, AddProductImagesDTO } from "./dto";
import { GetIndProduct, GetAllProducts, UpdatedProduct, AddedImages } from "./interface";
import { ApiResponse } from "src/common";


@Controller('product')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { };

    @Get()
    async getProducts(): Promise<ApiResponse<GetAllProducts[]>> {
        const result = await this.productsService.getAllProducts();
        return new ApiResponse(true, 'Products retrieved successfully', result);
    };

    @Post()
    async addProduct(@Body() product: AddProductDTO): Promise<ApiResponse> {
        const result = await this.productsService.addProduct(product);
        return new ApiResponse(true, 'Product added successfully', result);
    }

    @Get(':product_id')
    async getIndProduct(@Param('product_id') product_id: string): Promise<ApiResponse<GetIndProduct>> {
        const result = await this.productsService.getIndProduct(product_id);
        return new ApiResponse(true, 'Product retrieved successfully', result);
    }

    @Put(':product_id')
    async updateProduct(
        @Param('product_id', ParseUUIDPipe) product_id: string,
        @Body() body: UpdateProductDTO
    ): Promise<ApiResponse<UpdatedProduct>> {
        const result = await this.productsService.updateProduct(product_id, body);
        return new ApiResponse(true, 'Product updated successfully', result);
    }

    @Post(':product_id/images')
    async addProductImages(
        @Param('product_id', ParseUUIDPipe) product_id: string,
        @Body() body: AddProductImagesDTO
    ): Promise<ApiResponse<AddedImages>> {
        const result = await this.productsService.addProductImages(product_id, body);
        return new ApiResponse(true, 'Images added successfully', result);
    }

};