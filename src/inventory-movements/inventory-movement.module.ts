import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { InventoryMovementService } from "./inventory-movement.service";
import { InvnentoryMovementResolver } from "./inventory-movement.resolver";
import { WarehouseEntity } from "../warehouses/warehouse.entity";
import { ProductEntity } from '../products/product.entity';
import { ProductModule } from "../products/product.module";
import { WarehouseModule } from '../warehouses/warehouse.module';
import { ProductService } from "src/products/product.service";
import { WarehouseService } from "src/warehouses/warehouse.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryMovementsEntity, WarehouseEntity, ProductEntity]),
        ProductModule,
        WarehouseModule
    ],
    providers: [InventoryMovementService, InvnentoryMovementResolver, ProductService, WarehouseService],
})
export class InventoryMovementModule {}