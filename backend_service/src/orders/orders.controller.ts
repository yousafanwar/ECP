import { Post, Controller, Param, ParseUUIDPipe } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { ApiResponse } from "src/common";

@Controller('order')
export class OrderController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post(':userId/:cartId')
    async createOrder(@Param('userId') userId: ParseUUIDPipe, @Param('cartId') cartId: ParseUUIDPipe): Promise<ApiResponse> {
        const response = await this.ordersService.createOrder(userId, cartId);
        return new ApiResponse(true, 'Order created successfully', response);
    }
}