import { Post, Controller, Param, ParseUUIDPipe, Get, InternalServerErrorException, Delete } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { ApiResponse } from "src/common";

@Controller('order')
export class OrderController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post(':userId/:cartId')
    async createOrder(@Param('userId', ParseUUIDPipe) userId: string, @Param('cartId') cartId: ParseUUIDPipe): Promise<ApiResponse> {
        const response = await this.ordersService.createOrder(userId, cartId);
        return new ApiResponse(true, 'Order created successfully', response);
    }

    @Get(':orderId')
    async getOrderById(@Param('orderId', ParseUUIDPipe) orderId: string): Promise<ApiResponse> {
        const response = await this.ordersService.getOrderByOrderId(orderId);
        return new ApiResponse(true, 'Order fetched sucessfully', response);
    }

    @Delete(':orderId')
    async deleteOrderById(@Param('orderId', ParseUUIDPipe) orderId: string): Promise<ApiResponse> {
        const response = this.ordersService.deleteOrder(orderId);
        return new ApiResponse(true, 'Order deleted successfully', response);
    }
}