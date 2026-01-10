import { Param, Get, Body, Controller, InternalServerErrorException, Post, Delete } from "@nestjs/common";
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

    // fetch cart for the loggedIn user
    @Get('user/:user_id')
    async getUserCart(@Param('user_id') user_id: string){
        try{
            const result = await this.cartService.getUserCart(user_id);
            return { success: true, message: result.message, payload: result };
        }catch(err){
            throw new InternalServerErrorException('Error while fetching the cart');
        }
    }

    @Get(':cart_id')
    async getCartItems(@Param('cart_id') cart_id: string) {
        const result = await this.cartService.getCartItems(cart_id);
        return { success: true, payload: result };
    }

    @Delete('delete_cart/:cart_id')
    async deleteCart(@Param('cart_id') cart_id: string) {
        try {
            const result = await this.cartService.removeCart(cart_id);
            return { success: true, message: result.message, payload: result.payload };
        } catch (err) {
            console.error('Error while deleting cart', err);
            throw new InternalServerErrorException('Error while deleting cart');
        };
    };

    @Delete('delete_item/:cart_item_id')
    async deleteCartItem(@Param('cart_item_id') cart_item_id: string) {
        try {
            const result = await this.cartService.removeCartItem(cart_item_id);
            return { success: true, message: result.message, payload: result.payload };
        } catch (err) {
            console.error('Error while deleting cart item', err);
            throw new InternalServerErrorException('Error while deleting cart item');
        }
    }
}