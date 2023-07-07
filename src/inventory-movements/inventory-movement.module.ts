import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { InventoryMovementService } from "./inventory-movement.service";
import { InvnentoryMovementResolver } from "./inventory-movement.resolver";
import { WarehouseEntity } from "../warehouses/warehouse.entity";
import { ProductEntity } from '../products/product.entity';
import { ProductModule } from "src/products/product.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryMovementsEntity, WarehouseEntity, ProductEntity]),
        ProductModule
    ],
    providers: [InventoryMovementService, InvnentoryMovementResolver],
})
export class InventoryMovementModule {}