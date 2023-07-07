import { InjectRepository } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { LessThanOrEqual, Repository } from "typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { Direction, InventoryMovements, InventoryMovementsHistory, InventoryStock, ProductAvailability } from "./models/inventory-movements.types";
import { ImportInput } from "./models/import.input";

@Injectable()
export class InventoryMovementService {
    private readonly logger = new Logger(InventoryMovementService.name);

    constructor(
        @InjectRepository(InventoryMovementsEntity)
        private readonly inventoryMovementsRepository: Repository<InventoryMovementsEntity>
    ){}

    async findAll(): Promise<InventoryMovements[]> {
        return await this.inventoryMovementsRepository
            .find({ relations: ['product', 'warehouse']});
    }

    async import(input: ImportInput): Promise<InventoryMovements> {
        return await this.inventoryMovementsRepository
            .save(new InventoryMovementsEntity({
                ...input,
                direction: Direction.Import,
            }));
    }

    async getHistoryReport(
        fromDate: Date,
        toDate: Date, 
        warehouseId?: number
        ): Promise<InventoryMovementsHistory[]> {

        this.logger.debug(`History report from: ${fromDate} to: ${toDate}, warehouse: ${warehouseId}`);

        const query = this.inventoryMovementsRepository
            .createQueryBuilder("inventoryMovements")
            .innerJoinAndSelect("inventoryMovements.product", "product")
            .innerJoinAndSelect("inventoryMovements.warehouse", "warehouse")
            .where("inventoryMovements.date >= :fromDate", { fromDate: fromDate })
            .andWhere("inventoryMovements.date <= :toDate", { toDate: toDate })
            .andWhere(warehouseId ? "inventoryMovements.warehouseId = :warehouseId" : "1=1", { warehouseId: warehouseId })
            .orderBy("inventoryMovements.date", "ASC");
        const history = await query.getMany();

        this.logger.debug(history);

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
                     -movement.amount*movement.product.size}});
    }

    async checkForImportPossibility(
        hazardous: boolean, warehouseId: number
        ): Promise<boolean> {

        this.logger.debug(`Checking for hazardous in warehouse: ${warehouseId}, hazardous: ${hazardous}`);
        
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

        this.logger.debug(`Checking for inventory stock in warehouse: ${warehouseId}, date: ${date}`);

        const warehouseInventory = await this.inventoryMovementsRepository.find({
            select: ["warehouse", "product", "amount", "direction"],
            relations: ['warehouse', 'product'],
            where: [{ date: LessThanOrEqual(date), warehouseId: warehouseId}]
        });      
        
        this.logger.debug(warehouseInventory);

        return warehouseInventory.map((movement) => {
            return {
            capacity: movement.warehouse.capacity,
            currentStock: movement.direction === 'import' 
                        ? movement.amount*movement.product.size 
                        : -movement.amount*movement.product.size}});
    }

    async getProductAvailability(
        date: Date,
        productId: number, 
        warehouseId: number
        ): Promise<ProductAvailability[]> {

        const warehouseInventory = await this.inventoryMovementsRepository.find({
            select: ["product", "amount", "direction"],
            relations: ['product'],	
            where: [{ date: LessThanOrEqual(date), warehouseId: warehouseId, productId: productId}]});
        this.logger.debug(warehouseInventory);          
        
        return warehouseInventory.map((movement) => {
            return {
            availability: movement.direction === 'import' 
                        ? movement.amount 
                        : -movement.amount}});        
    }
}