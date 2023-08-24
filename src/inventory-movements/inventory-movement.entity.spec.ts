import { InventoryMovementsEntity } from './inventory-movement.entity';
import { Direction } from './models/direction.enum';


describe('InventoryMovementsEntity', () => {
    it('should be initialized through constructor', () => {
        const inventoryMovementy = new InventoryMovementsEntity({
            amount: 10
        });

        expect(inventoryMovementy).toEqual({
            amount: 10,
            direction: undefined,
            date: undefined,
            id: undefined,
            product: undefined,
            productId: undefined,
            user: undefined,
            userId: undefined,
            warehouse: undefined,
            warehouseId: undefined
        });
    });
});