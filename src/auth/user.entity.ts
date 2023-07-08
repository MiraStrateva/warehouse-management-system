import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InventoryMovementsEntity } from '../inventory-movements/inventory-movement.entity';

@Entity({name: "user"})
export class UserEntity {
    constructor(partial?: Partial<UserEntity>) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @OneToMany(() => InventoryMovementsEntity, (inventoryMovement) => inventoryMovement.user)
    inventoryMovements: InventoryMovementsEntity[];
}