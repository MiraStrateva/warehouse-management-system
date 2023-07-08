import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './products/product.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { WarehouseModule } from './warehouses/warehouse.module';
import { InventoryMovementModule } from './inventory-movements/inventory-movement.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [ormConfig],
    expandVariables: true,
    envFilePath: `${process.env.NODE_ENV}.env`
  }),
  TypeOrmModule.forRootAsync({
    useFactory: ormConfig
  }),
  GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: true,
    playground: true,
  }),
  AuthModule,
  ProductModule,
  WarehouseModule,
  InventoryMovementModule
  ],
})
export class AppModule {}
