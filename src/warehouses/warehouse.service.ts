import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { PaginateOptions, paginate } from "./../pagination/paginator";
import { WarehouseEntity } from "./warehouse.entity";
import { PaginatedWarehouses, WarehouseInventory } from "./models/warehouse.types";
import { WarehouseCreateInput } from "./models/warehouse.inputs";

export class WarehouseService {
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

    // TODO: Complete this method (not in requirements)
    // async getInventoryReport(): Promise<WarehouseInventory[]> {
    //     const warehouses = await this.warehouseRepository.find({ 
    //         relations: ["inventoryMovements"],
    //         select: ["inventoryMovements", "id", "name", "capacity", "description"],
    //         where: { deleted: false },
    //         order: { name: "ASC" }
    // }
}