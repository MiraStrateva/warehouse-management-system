import { Repository } from "typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { InventoryMovementService } from './inventory-movement.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from "@nestjs/typeorm";
import { Direction } from "./models/direction.enum";
import { ProductService } from "../products/product.service";
import { WarehouseService } from "../warehouses/warehouse.service";
import { CalculatorService } from './calculator.service';
import { ProductEntity } from "../products/product.entity";
import { WarehouseEntity } from "../warehouses/warehouse.entity";
import { HttpService } from "@nestjs/axios";
import { of } from "rxjs";
import { AxiosResponse } from "axios";

describe('InventoryMovementService', () => {	
    let inventoryMovementService: InventoryMovementService;
    let inventoryMovementRepository: Repository<InventoryMovementsEntity>;
    let selectQb;

    beforeEach(async () => {
        
        selectQb = {
            innerJoinAndSelect: jest.fn(), 
            select: jest.fn(),
            where: jest.fn(),
            andWhere: jest.fn(),
            groupBy: jest.fn(),
            addGroupBy: jest.fn(),
            getRawMany: jest.fn(),
            limit: jest.fn(),
            offset: jest.fn(),
            getMany: jest.fn(),
            getCount: jest.fn()
        };

        const data = 100;

        // const response: AxiosResponse<number, any> = {
        //     data,
        //     headers: {},
        //     config: { 
        //             url: 'http://localhost:3000/mockUrl', 
        //             method: 'get', 
        //             headers: AxiosRequestHeaders,
        //     status: 200,
        //     statusText: 'OK',
        // };

        const module = await Test.createTestingModule({
            providers: [
                InventoryMovementService, 
                {
                    provide: getRepositoryToken(InventoryMovementsEntity),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue(selectQb),
                        findOneBy: jest.fn(), 
                        save: jest.fn(),
                        where: jest.fn(),
                        execute: jest.fn(),
                        softDelete: jest.fn()
                    }
                }, 
                ProductService, 
                {
                    provide: getRepositoryToken(ProductEntity),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue(selectQb),
                        findOneBy: jest.fn(), 
                        save: jest.fn(),
                        where: jest.fn(),
                        execute: jest.fn(),
                        softDelete: jest.fn()
                    }
                },
                WarehouseService, 
                {
                    provide: getRepositoryToken(WarehouseEntity),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue(selectQb),
                        findOneBy: jest.fn(),
                        save: jest.fn(),
                        where: jest.fn(),
                        execute: jest.fn(),
                        softDelete: jest.fn()
                    }
                },
                CalculatorService,
            //     {
            //         provide: HttpService,
            //         useValue: {
            //             get: jest.fn(() => of(response)),
            //         },
            // }
            ]
        }).compile();

        inventoryMovementService = module.get<InventoryMovementService>(InventoryMovementService);
        inventoryMovementRepository = module.get<Repository<InventoryMovementsEntity>>(
            getRepositoryToken(InventoryMovementsEntity)
        );
    });

    describe('findAll', () => {
        it('should return a list of inventory movements', async () => {
            const createQueryBuilderSpy = jest.spyOn(inventoryMovementRepository, 'createQueryBuilder');
            const limitSpy = jest.spyOn(selectQb, 'limit').mockReturnValue(selectQb);
            const offsetSpy = jest.spyOn(selectQb, 'offset').mockReturnValue(selectQb);
            const getManySpy = jest.spyOn(selectQb, 'getMany')
                    .mockResolvedValue([{ id: 1, amount: 10, direction: Direction.IMPORT } as InventoryMovementsEntity]);
            const getCountSpy = jest.spyOn(selectQb, 'getCount').mockResolvedValue(1);

            class MockPaginateResult<T> {
                constructor(partial: Partial<MockPaginateResult<T>>) {
                Object.assign(this, partial);
                }
            
                first: number;
                last: number;
                limit: number;
                total?: number;
                data: T[];
            }
            
            jest.mock('./../pagination/paginator', () => ({
                Paginated: jest.fn().mockReturnValue(MockPaginateResult),
                paginate: jest.fn().mockResolvedValue({
                    first: 1, last: 1, total: 1, limit: 10, data: [{ id: 1, amount: 10, direction: Direction.IMPORT } as InventoryMovementsEntity]
                })          
            }));  

            expect(inventoryMovementService.findAll({ currentPage: 1, limit: 10, total: true }))
                .resolves
                .toEqual({
                    first: 1, last: 1, total: 1, limit: 10, data: [{ id: 1, amount: 10, direction: Direction.IMPORT } as InventoryMovementsEntity]
                });
            
            expect(createQueryBuilderSpy).toBeCalledTimes(1);
        });
    });
});