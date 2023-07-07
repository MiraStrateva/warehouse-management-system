import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from '../products/product.entity';
import { Direction } from "./models/inventory-movements.types";
import { WarehouseEntity } from '../warehouses/warehouse.entity';

@Entity({ name: 'inventory_movements' })
export class InventoryMovementsEntity {
    constructor(partial?: Partial<InventoryMovementsEntity>) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: Direction,
        default: Direction.Import
    })
    direction: Direction;

    @Column()
    date: Date;

    @Column()
    amount: number;

    @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.inventoryMovements)
    @JoinColumn({ name: 'warehouseId' })
    warehouse: WarehouseEntity;

    @Column()
    warehouseId: number;

    @ManyToOne(() => ProductEntity, (product) => product.inventoryMovements)
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column()
    productId: number;
}