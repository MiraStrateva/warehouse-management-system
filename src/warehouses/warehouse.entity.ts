import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InventoryMovementsEntity } from "../inventory-movements/inventory-movement.entity";

@Entity({ name: 'warehouse' })
export class WarehouseEntity {
    constructor(partial?: Partial<WarehouseEntity>) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    capacity: number;

    @Column({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => InventoryMovementsEntity, (inventoryMovements) => inventoryMovements.warehouse)
    inventoryMovements: InventoryMovementsEntity[]
}