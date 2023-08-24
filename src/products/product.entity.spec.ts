import { ProductEntity } from './product.entity';

describe('ProductEntity', () => {
    it('should be initialized through constructor', () => {
        const warehouse = new ProductEntity({
            name: 'PRD-001',
            description: 'Product 001'
        });

        expect(warehouse).toEqual({
            name: 'PRD-001',
            description: 'Product 001',
            id: undefined,
            size: undefined,
            hazardous: undefined,
            deletedAt: undefined,
            inventoryMovements: undefined
        });
    });
});