import { WarehouseEntity } from './warehouse.entity';

describe('WarehouseEntity', () => {
    it('should be initialized through constructor', () => {
        const warehouse = new WarehouseEntity({
            name: 'WRHS-001',
            description: 'WHRS-001 warehouse'
        });

        expect(warehouse).toEqual({
            name: 'WRHS-001',
            description: 'WHRS-001 warehouse',
            id: undefined,
            capacity: undefined,
            deletedAt: undefined,
            inventoryMovements: undefined
        });
    });
});