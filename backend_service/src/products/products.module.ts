import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { DbModule } from "src/db/db.module";

@Module({
    imports: [DbModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService]
})

export class ProductsModule { };