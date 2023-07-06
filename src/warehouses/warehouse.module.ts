import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WarehouseEntity } from "./warehouse.entity";
import { WarehouseService } from "./warehouse.service";
import { WarehouseResolver } from "./warehouse.resolver";

@Module({
    imports: [
        TypeOrmModule.forFeature([WarehouseEntity]),
    ],
    providers: [WarehouseService, WarehouseResolver],
})
export class WarehouseModule {}