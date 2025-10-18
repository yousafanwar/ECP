import { Get, Post, Body, Controller, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ProductsService } from "./products.service";


@Controller('product')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { };

    @Get()
    async getProducts() {
        try {
            const result = await this.productsService.getAllProducts();
            return { success: true, message: 'Products retreived successfuly', payload: result };
        } catch (err) {
            throw new InternalServerErrorException('Something went wrong while fetching the products')
        }
    };

    @Post()
    async addProduct(@Body() product: { name: string, price: number, sku: number, stock_quantity: number, description: string, category_id: number, brand_id: string, image_url: string, is_hero: boolean }) {
        try {
            const result = await this.productsService.addProduct(product);
            return { success: true, message: 'Product added successfully', payload: result };
        } catch (err) {
            if (err.code === '23505') {
                throw new BadRequestException('Product with this SKU already exists');
            }
            throw new InternalServerErrorException('Something went wrong while adding the product');
        }
    }
};