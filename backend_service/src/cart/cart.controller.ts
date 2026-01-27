import { Param, Get, Body, Controller, InternalServerErrorException, Post, Delete, Put, ParseUUIDPipe } from "@nestjs/common";
import { CartService } from "./cart.service";
import { get } from "http";

@Controller('cart')
export class CartController {

    constructor(private readonly cartService: CartService) { };

    // create new cart, updates items if cart already exists
    @Post()
    async addToCart(@Body() cart: { user_id: ParseUUIDPipe, product_id: ParseUUIDPipe, quantity: number }) {
        try {
            const result = await this.cartService.addToCart(cart);
            return { success: true, message: result.message, payload: result.payload };
        } catch (err) {
            throw new InternalServerErrorException('Error while creating the cart');
        }
    }

    // returns total cart items quantity in numbers (frontend usage: used for rendering cart items count on cart icon)
    @Get('cart-quantity/:cart_id')
    async getCartQuantity(@Param('cart_id') cart_id: ParseUUIDPipe) {
        try {
            const result = await this.cartService.fetchCartItemsQuantity(cart_id);
            return { success: true, message: "Quantity has been updated", payload: result };
        } catch (err) {
            throw new InternalServerErrorException('Error while updating cart quantity', err);
        }
    }


    // fetch cart for the loggedIn user, returns cart id
    @Get('user/:user_id')
    async getUserCart(@Param('user_id') user_id: ParseUUIDPipe) {
        try {
            const result = await this.cartService.getUserCart(user_id);
            return { success: true, message: result.message, payload: result };
        } catch (err) {
            throw new InternalServerErrorException('Error while fetching the cart');
        }
    }


    // deletes cart permanently
    @Delete('delete_cart/:cart_id')
    async deleteCart(@Param('cart_id') cart_id: ParseUUIDPipe) {
        try {
            const result = await this.cartService.removeCart(cart_id);
            return { success: true, message: result.message, payload: result.payload };
        } catch (err) {
            console.error('Error while deleting cart', err);
            throw new InternalServerErrorException('Error while deleting cart');
        };
    };

    // delete a single cart item
    @Delete('delete_item/:cart_item_id')
    async deleteCartItem(@Param('cart_item_id') cart_item_id: ParseUUIDPipe) {
        try {
            const result = await this.cartService.removeCartItem(cart_item_id);
            return { success: true, message: result.message, payload: result.payload };
        } catch (err) {
            console.error('Error while deleting cart item', err);
            throw new InternalServerErrorException('Error while deleting cart item');
        }
    }

    // updates cart quantity (frontend usage: updates quantity based on +/- buttons on cart page)
    @Put('qty-update')
    async updateCartQty(@Body() body: { product_id: ParseUUIDPipe, cart_item_id: ParseUUIDPipe, opType: string, cart_id: ParseUUIDPipe }) {
        try {
            const result = await this.cartService.updateCartItemQty(body);
            return { success: true, message: "Quantity has been updated", payload: result };
        } catch (err) {
            throw new InternalServerErrorException('Error while updating cart quantity', err);
        }
    }

    // fetches the cart along with its items
    @Get(':cart_id')
    async getCartItems(@Param('cart_id') cart_id: ParseUUIDPipe) {
        const result = await this.cartService.getCartItems(cart_id);
        return { success: true, payload: result };
    }

    // fetches current product stock against the product id (frontend usage: used on ind product page stock validation before hitting add to cart btn)
    @Get('check-stock/:product_id')
    async getProductStock(@Param('product_id') product_id: ParseUUIDPipe) {
        try {
            const result = await this.cartService.fetchProductStock(product_id);
            return result
        } catch (err) {
            throw new InternalServerErrorException('Could not fetch current stock', err);
        }

    }

    // fetches quantity of an ind item in the cart based on product id and cart id
    @Get('cart-item-qty/:product_id/:cart_id')
    async getCartItemQty(@Param('product_id') product_id: ParseUUIDPipe, @Param('cart_id') cart_id: ParseUUIDPipe) {
        try {
            const result = await this.cartService.fetchIndCartQty(product_id, cart_id);
            return result;
        } catch (err) {
            throw new InternalServerErrorException('Could not fetch cart item quantity', err);
        }
    }
}