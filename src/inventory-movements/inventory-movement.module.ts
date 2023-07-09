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
import { CalculatorService } from "src/inventory-movements/calculator.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InventoryMovementsEntity, 
            WarehouseEntity, 
            ProductEntity]),
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