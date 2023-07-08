import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProductEntity } from '../products/product.entity';
import { WarehouseEntity } from '../warehouses/warehouse.entity';
import { InventoryMovementsEntity } from '../inventory-movements/inventory-movement.entity';
import { UserEntity } from 'src/auth/user.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'example',
    database: 'warehouse-management',
    entities: [ProductEntity, WarehouseEntity, InventoryMovementsEntity, UserEntity],
    synchronize: true,
    dropSchema: false,
  })
);