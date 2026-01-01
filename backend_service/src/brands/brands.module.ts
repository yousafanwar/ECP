import { Module } from "@nestjs/common";
import { DbModule } from "src/db/db.module";
import { BrandsController } from "./brands.controller";
import { BrandsService } from "./brands.service";

@Module({
    imports: [DbModule],
    controllers: [BrandsController],
    providers: [BrandsService],
    exports: [BrandsService]
})

export class BrandsModule { };