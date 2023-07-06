import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './products/product.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { WarehouseModule } from './warehouses/warehouse.module';
import { InventoryMovementModule } from './inventory-movements/inventory-movement.module';

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
  ProductModule,
  WarehouseModule,
  InventoryMovementModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
