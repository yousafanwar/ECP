import { Post, Body, Controller, Param, ParseUUIDPipe, Get, InternalServerErrorException, Delete, Patch } from "@nestjs/common";
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

    @Get('user/:userId')
    async getOrdersByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<ApiResponse> {
        const response = await this.ordersService.getOrdersByUserId(userId);
        return new ApiResponse(true, 'Orders fetched successfully', response);
    }

    @Get()
    async getAllOrders(): Promise<ApiResponse> {
        const response = await this.ordersService.getAllOrders();
        return new ApiResponse(true, 'All orders fetched successfully', response);
    }

    @Get(':orderId')
    async getOrderById(@Param('orderId', ParseUUIDPipe) orderId: string): Promise<ApiResponse> {
        const response = await this.ordersService.getOrderByOrderId(orderId);
        return new ApiResponse(true, 'Order fetched sucessfully', response);
    }

    @Post(':orderId/payment/cod')
    async confirmCODOrder(@Param('orderId', ParseUUIDPipe) orderId: string): Promise<ApiResponse> {
        await this.ordersService.confirmCODOrder(orderId);
        return new ApiResponse(true, 'Order confirmed for cash on delivery', null);
    }

    @Delete(':orderId')
    async deleteOrderById(@Param('orderId', ParseUUIDPipe) orderId: string): Promise<ApiResponse> {
        const response = this.ordersService.deleteOrder(orderId);
        return new ApiResponse(true, 'Order deleted successfully', response);
    }

    @Patch(':orderId/status')
    async updateOrderStatus(
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() body: { status: string },
    ): Promise<ApiResponse> {
        await this.ordersService.updateOrderStatus(orderId, body.status);
        return new ApiResponse(true, 'Order status updated successfully', null);
    }
}