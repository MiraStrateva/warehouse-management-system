import { Repository } from "typeorm";
import { WarehouseService } from "./warehouse.service";
import { WarehouseEntity } from "./warehouse.entity";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { WarehouseCreateInput, WarehouseEditInput } from "./models/warehouse.inputs";

describe('WarehouseService', () => {	
    let warehouseService: WarehouseService;
    let warehouseRepository: Repository<WarehouseEntity>;
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

        const module = await Test.createTestingModule({
            providers: [
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
                }
            ]
        }).compile();

        warehouseService = module.get<WarehouseService>(WarehouseService);
        warehouseRepository = module.get<Repository<WarehouseEntity>>(
            getRepositoryToken(WarehouseEntity)
        );
    });

    describe('findAll', () => {
        it('should return a list of warehouses', async () => {
            const createQueryBuilderSpy = jest.spyOn(warehouseRepository, 'createQueryBuilder');
            const limitSpy = jest.spyOn(selectQb, 'limit').mockReturnValue(selectQb);
            const offsetSpy = jest.spyOn(selectQb, 'offset').mockReturnValue(selectQb);
            const getManySpy = jest.spyOn(selectQb, 'getMany')
                    .mockResolvedValue([{ id: 1, name: 'WHS 1' } as WarehouseEntity]);
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
                    first: 1, last: 1, total: 1, limit: 10, data: [{ id: 1, name: 'WHS 1' } as WarehouseEntity]
                })          
            }));  

            expect(warehouseService.findAll({ currentPage: 1, limit: 10, total: true }))
                .resolves
                .toEqual({
                    first: 1, last: 1, total: 1, limit: 10, data: [{ id: 1, name: 'WHS 1' } as WarehouseEntity]
                });
            
            expect(createQueryBuilderSpy).toBeCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('should return a warehouse', async () => {
            const repoFindOneBySpy = jest.spyOn(warehouseRepository, 'findOneBy')
                .mockResolvedValue({ id: 1, name: "WHS 1" } as WarehouseEntity);

            expect(warehouseService.findOne(1))
                .resolves
                .toEqual({ id: 1, name: 'WHS 1' } as WarehouseEntity);

            expect(repoFindOneBySpy).toBeCalledTimes(1);
        });

        it('should throw an error if warehouse does not exist', async () => {
            jest.spyOn(warehouseRepository, 'findOneBy')
                .mockResolvedValue(undefined);

            expect(warehouseService.findOne(1))
                .rejects
                .toThrowError();
        });
    });

    describe('create', () => {
        it('should return a warehouse', async () => {
            const repoSaveSpy = jest.spyOn(warehouseRepository, 'save')
                .mockResolvedValue({ id: 1, name: "WHS 1" } as WarehouseEntity);
            const input = new WarehouseCreateInput();   
            input.name = 'WHS 1';

            expect(warehouseService.create(input))
                .resolves
                .toEqual({ id: 1, name: 'WHS 1' } as WarehouseEntity);

            expect(repoSaveSpy).toBeCalledTimes(1);
        });
    });

    describe('updateWarehouse', () => {
        it('should update a warehouse', async () => {
            const repoFindOneBySpy = jest.spyOn(warehouseRepository, 'findOneBy')
                .mockResolvedValue({ id: 1, name: "WHS 1" } as WarehouseEntity);
            const repoSaveSpy = jest.spyOn(warehouseRepository, 'save')
                .mockResolvedValue({ id: 1, name: "WHS 1", description: "Warehouse 1" } as WarehouseEntity);

            const result = await warehouseService.update(1, new WarehouseEditInput({ id: 1, description: 'Warehouse 1' }));
            
            expect(result)
                .toEqual({ id: 1, name: "WHS 1", description: 'Warehouse 1' } as WarehouseEntity);
            expect(repoFindOneBySpy).toBeCalledTimes(1);
            expect(repoSaveSpy).toBeCalledTimes(1);
        });

        it('should throw an error if warehouse does not exist', async () => {
            jest.spyOn(warehouseRepository, 'findOneBy')
                .mockResolvedValue(undefined);

            expect(warehouseService
                .update(1, new WarehouseEntity({ id: 1, name: 'New name' })))
                .rejects
                .toThrowError();
        });
    });

    describe('deleteWarehouse', () => { 
        it('should delete a warehouse', async () => {
            const createQueryBuilderSpy = jest.spyOn(warehouseRepository, 'createQueryBuilder');
            const innerJoinAndSelectSpy = jest.spyOn(selectQb, 'innerJoinAndSelect').mockReturnValue(selectQb);
            const selectSpy = jest.spyOn(selectQb, 'select').mockReturnValue(selectQb);
            const whereSpy = jest.spyOn(selectQb, 'where').mockReturnValue(selectQb);
            const andWhereSpy = jest.spyOn(selectQb, 'andWhere').mockReturnValue(selectQb);
            const groupBySpy = jest.spyOn(selectQb, 'groupBy').mockReturnValue(selectQb);
            const addGroupBySpy = jest.spyOn(selectQb, 'addGroupBy').mockReturnValue(selectQb);
            const getRawManySpy = jest.spyOn(selectQb, 'getRawMany')
                .mockResolvedValue([{ id: 1, name: "WRH 1", description: "Warehouse 1", capacity: 100, currentStock: 0 }]);

            const softDeleteSpy = jest.spyOn(warehouseRepository, 'softDelete')
                .mockResolvedValue(undefined);

            const result = await warehouseService.delete(1);
            
            expect(result).toBe(undefined);

            expect(createQueryBuilderSpy).toBeCalledTimes(1);
            expect(createQueryBuilderSpy).toBeCalledWith('warehouse');
            expect(innerJoinAndSelectSpy).toBeCalledTimes(2);
            expect(selectSpy).toBeCalledTimes(1);
            expect(whereSpy).toBeCalledTimes(1);
            expect(andWhereSpy).toBeCalledTimes(2);
            expect(groupBySpy).toBeCalledTimes(1);
            expect(addGroupBySpy).toBeCalledTimes(3);
            expect(getRawManySpy).toBeCalledTimes(1);
            expect(softDeleteSpy).toBeCalledTimes(1);
            expect(softDeleteSpy).toBeCalledWith(1);
        });

        it('should throw an error if warehouse cannot be deleted (has products)', async () => {
            const createQueryBuilderSpy = jest.spyOn(warehouseRepository, 'createQueryBuilder');
            const innerJoinAndSelectSpy = jest.spyOn(selectQb, 'innerJoinAndSelect').mockReturnValue(selectQb);
            const selectSpy = jest.spyOn(selectQb, 'select').mockReturnValue(selectQb);
            const whereSpy = jest.spyOn(selectQb, 'where').mockReturnValue(selectQb);
            const andWhereSpy = jest.spyOn(selectQb, 'andWhere').mockReturnValue(selectQb);
            const groupBySpy = jest.spyOn(selectQb, 'groupBy').mockReturnValue(selectQb);
            const addGroupBySpy = jest.spyOn(selectQb, 'addGroupBy').mockReturnValue(selectQb);
            const getRawManySpy = jest.spyOn(selectQb, 'getRawMany')
                .mockResolvedValue([{ id: 1, name: "WRH 1", description: "Warehouse 1", capacity: 100, currentStock: 50 }]);

            const softDeleteSpy = jest.spyOn(warehouseRepository, 'softDelete')
                .mockResolvedValue(undefined);
            
            expect(warehouseService.delete(1))
            .rejects
            .toThrowError(`Can't delete warehouse with products in it`);

            expect(createQueryBuilderSpy).toBeCalledTimes(1);
            expect(createQueryBuilderSpy).toBeCalledWith('warehouse');
            expect(innerJoinAndSelectSpy).toBeCalledTimes(2);
            expect(selectSpy).toBeCalledTimes(1);
            expect(whereSpy).toBeCalledTimes(1);
            expect(andWhereSpy).toBeCalledTimes(2);
            expect(groupBySpy).toBeCalledTimes(1);
            expect(addGroupBySpy).toBeCalledTimes(3);
            expect(getRawManySpy).toBeCalledTimes(1);
            expect(softDeleteSpy).toBeCalledTimes(0);
        });
    });

    describe('getInventoryReport', () => {
        it('should return a warehouse inventory', async () => {
            const createQueryBuilderSpy = jest.spyOn(warehouseRepository, 'createQueryBuilder');
            const innerJoinAndSelectSpy = jest.spyOn(selectQb, 'innerJoinAndSelect').mockReturnValue(selectQb);
            const selectSpy = jest.spyOn(selectQb, 'select').mockReturnValue(selectQb);
            const whereSpy = jest.spyOn(selectQb, 'where').mockReturnValue(selectQb);
            const andWhereSpy = jest.spyOn(selectQb, 'andWhere').mockReturnValue(selectQb);
            const groupBySpy = jest.spyOn(selectQb, 'groupBy').mockReturnValue(selectQb);
            const addGroupBySpy = jest.spyOn(selectQb, 'addGroupBy').mockReturnValue(selectQb);
            const getRawManySpy = jest.spyOn(selectQb, 'getRawMany')
                .mockResolvedValue([{ id: 1, name: "WRH 1", description: "Warehouse 1", capacity: 100, currentStock: 0 },
                                   { id: 2, name: "WRH 2", description: "Warehouse 2", capacity: 100, currentStock: 50 }]);

            const result = await warehouseService.getInventoryReport(new Date());
            
            expect(result)
                .toEqual([{ id: 1, name: "WRH 1", capacity: 100, description: "Warehouse 1", currentStock: 0, remainingCapacity: 100 },
                        { id: 2, name: "WRH 2", capacity: 100, description: "Warehouse 2", currentStock: 50, remainingCapacity: 50 }]);

            expect(createQueryBuilderSpy).toBeCalledTimes(1);
            expect(createQueryBuilderSpy).toBeCalledWith('warehouse');
            expect(innerJoinAndSelectSpy).toBeCalledTimes(2);
            expect(selectSpy).toBeCalledTimes(1);
            expect(whereSpy).toBeCalledTimes(1);
            expect(andWhereSpy).toBeCalledTimes(2);
            expect(groupBySpy).toBeCalledTimes(1);
            expect(addGroupBySpy).toBeCalledTimes(3);
            expect(getRawManySpy).toBeCalledTimes(1);
        });
    });
});
