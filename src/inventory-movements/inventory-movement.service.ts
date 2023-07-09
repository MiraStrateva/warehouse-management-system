import { InjectRepository } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { LessThanOrEqual, Repository } from "typeorm";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Direction, 
         InventoryMovements, 
         InventoryMovementsHistory, 
         InventoryStock, 
         PaginatedInventoryMovements, 
         ProductAvailability } from "./models/inventory-movements.types";
import { ImportExportInput } from "./models/import-export.input";
import { UserEntity } from "../auth/user.entity";
import { PaginateOptions, paginate } from "../pagination/paginator";

@Injectable()
export class InventoryMovementService {
    private readonly logger = new Logger(InventoryMovementService.name);

    constructor(
        @InjectRepository(InventoryMovementsEntity)
        private readonly inventoryMovementsRepository: Repository<InventoryMovementsEntity>
    ){}

    async findAll(input: PaginateOptions): Promise<PaginatedInventoryMovements> {
        return await paginate<InventoryMovementsEntity, PaginatedInventoryMovements>(
            this.inventoryMovementsRepository.createQueryBuilder("inventoryMovements")
                .innerJoinAndSelect("inventoryMovements.product", "product")
                .innerJoinAndSelect("inventoryMovements.warehouse", "warehouse")
                .innerJoinAndSelect("inventoryMovements.user", "user"),
            PaginatedInventoryMovements,
            input
        );
    }

    async findOne(id: number): Promise<InventoryMovementsEntity | undefined> {
        const inventoryMovement = await this.inventoryMovementsRepository
            .findOne({where: {id: id}, relations: ["product", "warehouse", "user"]});
        if (!inventoryMovement) {
            throw new NotFoundException();
        }

        return inventoryMovement;
    }

    async import(input: ImportExportInput, user: UserEntity): Promise<InventoryMovements> {
        const imported = await this.inventoryMovementsRepository
            .save(new InventoryMovementsEntity({
                ...input,
                user: user,
                direction: Direction.Import,
            }));

        return this.findOne(imported.id);
    }

    async export(input: ImportExportInput, user: UserEntity): Promise<InventoryMovements> {
        const exported = await this.inventoryMovementsRepository
            .save(new InventoryMovementsEntity({
                ...input,
                user: user,
                direction: Direction.Export,
            }));

        return this.findOne(exported.id);
    }

    async getHistoryReport(
        fromDate: Date,
        toDate: Date, 
        warehouseId?: number
        ): Promise<InventoryMovementsHistory[]> {

        this.logger.log(`History report from: ${fromDate} to: ${toDate}, warehouse: ${warehouseId}`);

        const history = await this.inventoryMovementsRepository
            .createQueryBuilder("inventoryMovements")
            .innerJoinAndSelect("inventoryMovements.product", "product")
            .innerJoinAndSelect("inventoryMovements.warehouse", "warehouse")
            .innerJoinAndSelect("inventoryMovements.user", "user")
            .where("inventoryMovements.date >= :fromDate", { fromDate: fromDate })
            .andWhere("inventoryMovements.date <= :toDate", { toDate: toDate })
            .andWhere(warehouseId ? "inventoryMovements.warehouseId = :warehouseId" : "1=1", { warehouseId: warehouseId })
            .orderBy("inventoryMovements.date", "ASC")
            .getMany();

        return history.map((movement) => {
            return {
                date: movement.date,
                direction: movement.direction,
                productName: movement.product.name,
                amount: movement.amount,
                size: movement.product.size,
                warehouseName: movement.warehouse.name,
                total: movement.direction === 'import' ?
                     movement.amount*movement.product.size :
                     -movement.amount*movement.product.size,
                userName: movement.user.username}});
    }

    async checkForImportPossibility(
        hazardous: boolean, warehouseId: number
        ): Promise<boolean> {

        this.logger.log(`Checking for hazardous in warehouse: ${warehouseId}, hazardous: ${hazardous}`);
        
        const lastWarehouseInventory = await this.inventoryMovementsRepository.findOne({
            select: ["product"],
            relations: ['product'],
            where: [{ warehouseId: warehouseId}],
            order: { date: "DESC" }});

        return (lastWarehouseInventory == null ||
            lastWarehouseInventory.product.hazardous === hazardous);
    }

    async getWarehouseInventory(
        date: Date,
        warehouseId: number
        ): Promise<InventoryStock[]> {

        this.logger.log(`Checking for inventory stock in warehouse: ${warehouseId}, date: ${date}`);

        const warehouseInventory = await this.inventoryMovementsRepository.find({
            select: ["warehouse", "product", "amount", "direction"],
            relations: ['warehouse', 'product'],
            where: [{ date: LessThanOrEqual(date), warehouseId: warehouseId}]
        });

        return warehouseInventory.map((movement) => {
            return {
            capacity: movement.warehouse.capacity,
            currentStock: movement.direction === Direction.Import 
                        ? movement.amount*movement.product.size 
                        : -movement.amount*movement.product.size}});
    }

    async getProductAvailability(
        date: Date,
        productId: number, 
        warehouseId: number
        ): Promise<ProductAvailability[]> {

        this.logger.log(`Checking for product availability in warehouse: ${warehouseId}, product: ${productId}, date: ${date}`);

        const warehouseInventory = await this.inventoryMovementsRepository.find({
            select: ["product", "amount", "direction"],
            relations: ['product'],	
            where: [{ date: LessThanOrEqual(date), warehouseId: warehouseId, productId: productId}]});
        
        return warehouseInventory.map((movement) => {
            return {
            availability: movement.direction === 'import' 
                        ? movement.amount 
                        : -movement.amount}});        
    }
}