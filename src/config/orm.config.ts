import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProductEntity } from '../products/product.entity';
import { WarehouseEntity } from '../warehouses/warehouse.entity';
import { InventoryMovementsEntity } from '../inventory-movements/inventory-movement.entity';
import { UserEntity } from '../auth/user.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'example',
    database: process.env.DB_NAME || 'warehouse-management',
    entities: [ProductEntity, WarehouseEntity, InventoryMovementsEntity, UserEntity],
    synchronize: true,
    dropSchema: Boolean(process.env.DB_DROP_SCHEMA) || false,
  })
);