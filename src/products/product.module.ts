import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { ProductResolver } from "./product.resolver";
import { ProductService } from "./product.service";
import { IsProductValidator } from "./validators/is-product.validator";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity]),
    ],
    providers: [ProductResolver, ProductService, IsProductValidator],
})
export class ProductModule {}