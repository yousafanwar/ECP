import { Get, Post, Body, Controller, BadRequestException, InternalServerErrorException, Param } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { AddProductDTO } from "./dto";
import { GetIndProduct, GetAllProducts } from "./interface";
import { toArray } from "rxjs";


@Controller('product')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { };

    @Get()
    async getProducts(): Promise<GetAllProducts[]> {
        const result = await this.productsService.getAllProducts();
        return result;
    };

    @Post()
    async addProduct(@Body() product: AddProductDTO) {
        const result = await this.productsService.addProduct(product);
        return result;
    }

    @Get(':product_id')
    async getIndProduct(@Param('product_id') product_id: string): Promise<GetIndProduct> {
        const result = await this.productsService.getIndProduct(product_id);
        return result;
    }

};