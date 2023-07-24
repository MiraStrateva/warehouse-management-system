import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InventoryMovementsEntity } from '../inventory-movements/inventory-movement.entity';

@Entity({ name: 'product' })
export class ProductEntity {
    constructor(partial?: Partial<ProductEntity>) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    size: number;

    @Column({default: false})
    hazardous: boolean;

    @Column({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => InventoryMovementsEntity, (inventoryMovements) => inventoryMovements.product)
    inventoryMovements: InventoryMovementsEntity[]
}

