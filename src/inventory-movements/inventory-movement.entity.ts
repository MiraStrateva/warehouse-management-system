import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from '../products/product.entity';
import { Direction } from "./models/inventory-movements.types";
import { WarehouseEntity } from '../warehouses/warehouse.entity';
import { UserEntity } from "src/auth/user.entity";

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
        default: Direction.IMPORT
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

    @ManyToOne(() => UserEntity, (user) => user.inventoryMovements)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    userId: number;
}