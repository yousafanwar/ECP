import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { ProductsModule } from './products/products.module';
import { cartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [UsersModule, DbModule, ProductsModule, cartModule, CategoriesModule, BrandsModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
