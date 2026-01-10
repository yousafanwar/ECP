import { Post, Controller, Param } from "@nestjs/common";
import { OrdersService } from "./orders.service";
// import { FetchAllBrands } from "./interface";

@Controller('order')
export class OrderController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post(':userId/:cartId')
    async createOrder(@Param('userId') userId: string, @Param('cartId') cartId: string): Promise<string> {
        const response = await this.ordersService.createOrder(userId, cartId);
        return response;
    }
}