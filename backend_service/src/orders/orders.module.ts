import { Module } from "@nestjs/common";
import { DbModule } from "src/db/db.module";
import { OrderController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
    imports: [DbModule],
    controllers: [OrderController],
    providers: [OrdersService],
    exports: [OrdersService]
})

export class OrdersModule { };