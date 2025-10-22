import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { DbModule } from "src/db/db.module";

@Module({
    imports: [DbModule],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService]
})

export class cartModule { }