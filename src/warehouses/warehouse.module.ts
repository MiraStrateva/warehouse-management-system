import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WarehouseEntity } from "./warehouse.entity";
import { WarehouseService } from "./warehouse.service";
import { WarehouseResolver } from "./warehouse.resolver";
import { IsWarehouseValidator } from "./validators/is-warehouse.validator";

@Module({
    imports: [
        TypeOrmModule.forFeature([WarehouseEntity]),
    ],
    providers: [WarehouseService, WarehouseResolver, IsWarehouseValidator],
})
export class WarehouseModule {}