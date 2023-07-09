import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { InventoryMovementService } from "./inventory-movement.service";
import { InvnentoryMovementResolver } from "./inventory-movement.resolver";
import { ProductService } from "../products/product.service";
import { WarehouseService } from "../warehouses/warehouse.service";
import { CalculatorService } from "../inventory-movements/calculator.service";
import { HttpModule } from "@nestjs/axios";
import { ProductModule } from '../products/product.module';
import { WarehouseModule } from '../warehouses/warehouse.module';
import { ProductEntity } from "src/products/product.entity";
import { WarehouseEntity } from "src/warehouses/warehouse.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InventoryMovementsEntity,
            ProductEntity,
            WarehouseEntity]),
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
          }),
        ProductModule,
        WarehouseModule
    ],
    providers: [
        InventoryMovementService, 
        InvnentoryMovementResolver, 
        ProductService, 
        WarehouseService, 
        CalculatorService],
})
export class InventoryMovementModule {}