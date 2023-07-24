import { InjectRepository } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { LessThanOrEqual, Repository } from "typeorm";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Direction, 
         Inventory, 
         InventoryMovements, 
         InventoryMovementsHistoryReport, 
         InventoryStock, 
         PaginatedInventoryMovements, 
         ProductAvailability } from "./models/inventory-movements.types";
import { ImportExportInput } from "./models/import-export.input";
import { UserEntity } from "../users/user.entity";
import { PaginateOptions, paginate } from "../pagination/paginator";
import { ProductService } from '../products/product.service';
import { WarehouseService } from '../warehouses/warehouse.service';
import { CalculatorService } from './calculator.service';

@Injectable()
export class InventoryMovementService {
    private readonly logger = new Logger(InventoryMovementService.name);

    constructor(
        @InjectRepository(InventoryMovementsEntity)
        private readonly inventoryMovementsRepository: Repository<InventoryMovementsEntity>,
        private readonly productService: ProductService,
        private readonly warehouseService: WarehouseService,
        private readonly calculatorService: CalculatorService
    ){}

    async findAll(input: PaginateOptions): Promise<PaginatedInventoryMovements> {
        return await paginate<InventoryMovementsEntity, PaginatedInventoryMovements>(
            this.inventoryMovementsRepository.createQueryBuilder("inventoryMovements")
                .withDeleted()
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
        // Check if import is possible
        // 1. hazardous products are not kept in the same warehouse as non-hazardous products
        var product = await this.productService.findOne(input.productId);
        if (!await this.checkForImportPossibility(product.hazardous, input.warehouseId)){
            throw new Error(
                "Hazardous products are not kept in the same warehouse as non-hazardous products");
        }

        // 2. warehouse capacity is not exceeded
        var warehouseInventory = await this
            .getWarehouseInventory(input.date, input.warehouseId);

        if (warehouseInventory.length > 0){
            let currentWarehouseStock = 0;
            warehouseInventory.forEach(product => {
                currentWarehouseStock += product.currentStock;
            });

            if (input.amount > (warehouseInventory[0].capacity - currentWarehouseStock)){
                throw new Error(
                    "There is not enough space in the warehouse to import this amount of products");
            }
        }

        const imported = await this.inventoryMovementsRepository
            .save(new InventoryMovementsEntity({
                ...input,
                user: user,
                direction: Direction.IMPORT,
            }));

        return this.findOne(imported.id);
    }

    async export(input: ImportExportInput, user: UserEntity): Promise<InventoryMovements> {
        // Check if export is possible
        // 1. warehouse has enough stock
        var productAvailability = await this
            .getProductAvailability(input.date, input.productId, input.warehouseId);

        let sum = 0;
        productAvailability.forEach(number => {
            sum += number.availability;
        });
       
        if (input.amount > sum){
            throw new Error(
                "There is not enough stock in the warehouse to export this amount of products");
        }

        const exported = await this.inventoryMovementsRepository
            .save(new InventoryMovementsEntity({
                ...input,
                user: user,
                direction: Direction.EXPORT,
            }));

        return this.findOne(exported.id);
    }

    async getHistoryReport(
        fromDate: Date,
        toDate: Date, 
        warehouseId?: number
        ): Promise<InventoryMovementsHistoryReport[]> {

        this.logger.log(`History report from: ${fromDate} to: ${toDate}, warehouse: ${warehouseId}`);

        const history = await this.inventoryMovementsRepository
            .createQueryBuilder("inventoryMovements")
            .withDeleted()
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
                total: movement.direction === Direction.IMPORT ?
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
            currentStock: movement.direction === Direction.IMPORT 
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
            availability: movement.direction === Direction.IMPORT
                        ? movement.amount 
                        : -movement.amount}});        
    }

    async getWarehouseInventoryReport(date: Date,
        warehouseId: number
        ): Promise<Inventory[]> {

        const inventoryStock = await this.getWarehouseInventory(
            date, warehouseId);

        if (inventoryStock.length === 0){
            var warehouse = await this.warehouseService.findOne(warehouseId);
            return [new Inventory({
                capacity: warehouse.capacity, 
                currentStock: 0, 
                remainingCapacity: warehouse.capacity})];
        }

        let currentWarehouseStock = 0;
        inventoryStock.forEach(product => {
            currentWarehouseStock += product.currentStock;
        });

        const remainingCapacity = await this.calculatorService.calculate(
            `${inventoryStock[0].capacity}-${currentWarehouseStock}`);

        return [new Inventory({
                capacity: inventoryStock[0].capacity,
                currentStock: currentWarehouseStock,
                remainingCapacity: remainingCapacity})];
    }
}