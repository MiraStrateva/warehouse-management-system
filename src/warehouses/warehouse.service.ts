import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Logger, NotFoundException } from "@nestjs/common";
import { PaginateOptions, paginate } from "./../pagination/paginator";
import { WarehouseEntity } from "./warehouse.entity";
import { WarehouseInventory, PaginatedWarehouses } from './models/warehouse.types';
import { WarehouseCreateInput } from "./models/warehouse.inputs";

export class WarehouseService {
    private readonly logger = new Logger(WarehouseService.name);

    constructor(
        @InjectRepository(WarehouseEntity)
        private readonly warehouseRepository: Repository<WarehouseEntity>
    ){}

    async findAll(input: PaginateOptions): Promise<PaginatedWarehouses> {
        return await paginate<WarehouseEntity, PaginatedWarehouses>(
            this.warehouseRepository.createQueryBuilder()
                .where("deleted = :deleted", { deleted: false }),
            PaginatedWarehouses,
            input
        );
    }

    async findOne(id: number): Promise<WarehouseEntity | undefined> {
        const warehosue = await this.warehouseRepository.findOneBy({id: id, deleted: false});
        if (!warehosue) {
            throw new NotFoundException();
        }

        return warehosue;
    }

    async create(input: WarehouseCreateInput): Promise<WarehouseEntity> {
        return await this.warehouseRepository.save(new WarehouseEntity(input));
    }

    async update(id: number, input: WarehouseEntity): Promise<WarehouseEntity> {
        if (await this.findOne(id)) {
            await this.warehouseRepository.update(id, input);
            return await this.findOne(id);
        }
    }

    async delete(id: number): Promise<void> {
        const warehouse = await this.findOne(id);
        warehouse.deleted = true;
        await this.warehouseRepository.update(id, warehouse);
    }

    async getInventoryReport(        
        date: Date, 
        warehouseId?: number): Promise<WarehouseInventory[]> {
        
        const warehouses = await this.warehouseRepository
            .createQueryBuilder("warehouse")
            .innerJoinAndSelect("warehouse.inventoryMovements", "inventoryMovements")
            .innerJoinAndSelect("inventoryMovements.product", "product")
            .select([
                'warehouse.id AS "id"',
                'warehouse.name AS "name"',
                'warehouse.description AS "description"',
                'warehouse.capacity AS "capacity"',
                `SUM(CASE WHEN "inventoryMovements"."direction" = 'import' THEN "inventoryMovements"."amount"*"product"."size" ELSE -"inventoryMovements"."amount"*"product"."size" END) AS "currentStock"`,
              ])
            .where("warehouse.deleted = :deleted", { deleted: false })
            .andWhere("inventoryMovements.date <= :date", { date: date })
            .andWhere(warehouseId ? "inventoryMovements.warehouseId = :warehouseId" : "1=1", { warehouseId: warehouseId })
            .groupBy('warehouse.id')
            .addGroupBy('warehouse.name')
            .addGroupBy('warehouse.description')
            .addGroupBy('warehouse.capacity')
            .getRawMany();

        return warehouses.map(warehouse => {
            return {
                id: warehouse.id,
                name: warehouse.name,
                capacity: warehouse.capacity,
                description: warehouse.description,
                currentStock: warehouse.currentStock, 
                remainingCapacity: warehouse.capacity - warehouse.currentStock
            }
        });
    }
}