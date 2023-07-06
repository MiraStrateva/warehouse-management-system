import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

    @Column({default: false})
    deleted: boolean;

    @OneToMany(() => InventoryMovementsEntity, (inventoryMovements) => inventoryMovements.product)
    inventoryMovements: InventoryMovementsEntity[]
}