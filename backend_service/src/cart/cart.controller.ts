import { Param, Get, BadRequestException, Body, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller('cart')
export class CartController {

    constructor(private readonly cartService: CartService) { };

    @Post()
    async addToCart(@Body() cart: { user_id: string, product_id: number, quantity: number }) {
        try {
            const result = await this.cartService.addToCart(cart);
            return { success: true, message: result.message, payload: result.payload };
        } catch (err) {
            throw new InternalServerErrorException('Error while creating the cart');
        }
    }

    @Get(':cart_id')
    async getCartItems(@Param('cart_id') cart_id: number) {
        const result = await this.cartService.getCartItems(cart_id);
        return { success: true, payload: result };
    }
}