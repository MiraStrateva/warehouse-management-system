import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProductEntity } from '../products/product.entity';
import { WarehouseEntity } from '../warehouses/warehouse.entity';
import { InventoryMovementsEntity } from '../inventory-movements/inventory-movement.entity';
import { UserEntity } from '../users/user.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,                          
    port: Number(process.env.DB_PORT),                  
    username: process.env.DB_USER,                      
    password: process.env.DB_PASSWORD,                 
    database: process.env.DB_NAME,                      
    entities: [ProductEntity, WarehouseEntity, InventoryMovementsEntity, UserEntity],
    synchronize: true,
    //dropSchema: Boolean(process.env.DB_DROP_SCHEMA), 
  })
);