import { Repository, UpdateResult } from "typeorm";
import { WarehouseService } from "./warehouse.service";
import { WarehouseEntity } from "./warehouse.entity";
import * as paginator from './../pagination/paginator';
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

jest.mock('./../pagination/paginator');

describe('WarehouseService', () => {	
    let warehouseService: WarehouseService;
    let warehouseRepository: Repository<WarehouseEntity>;
    let mockedPaginate;
    let selectQb;

    beforeEach(async () => {
        mockedPaginate = paginator.paginate as jest.Mock;
        
        selectQb = {
            where: jest.fn(),
            execute: jest.fn(),
            orderBy: jest.fn(),
            leftJoinAndSelect: jest.fn()
        };

        const module = await Test.createTestingModule({
            providers: [
                WarehouseService, {
                    provide: getRepositoryToken(WarehouseEntity),
                    useValue: {
                        save: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue(selectQb),
                        delete: jest.fn(),
                        where: jest.fn(),
                        execute: jest.fn(), 
                        findOneBy: jest.fn(), 
                        update: jest.fn()
                    }
                }
            ]
        }).compile();

        warehouseService = module.get<WarehouseService>(WarehouseService);
        warehouseRepository = module.get<Repository<WarehouseEntity>>(
            getRepositoryToken(WarehouseEntity)
        );
    });

    describe('updateWarehouse', () => {
        it('should update a warehouse', async () => {

            const repoUpdateSpy = jest.spyOn(warehouseRepository, 'update')
                .mockResolvedValue({ affected: 1 } as UpdateResult);

            const repoFindOneBySpy = jest.spyOn(warehouseRepository, 'findOneBy')
                 .mockResolvedValue({ id: 1 } as WarehouseEntity);

            expect(warehouseService
                .update(1, new WarehouseEntity({ id: 1, name: 'New name' })))
                .resolves
                .toEqual({ id: 1 } as WarehouseEntity);
            expect(repoFindOneBySpy).toBeCalledTimes(1);
            expect(repoFindOneBySpy).toBeCalledWith({id: 1, deleted: false});    
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
            const findOneSpy = jest.spyOn(warehouseRepository, 'findOneBy')
                .mockResolvedValue(new WarehouseEntity({ id: 1, name: 'New name', capacity: 10 }));
            const updateSpy = jest.spyOn(warehouseRepository, 'update')
                .mockResolvedValue({ affected: 1 } as UpdateResult);;

            expect(warehouseService
                .delete(1))
                .resolves
                .toBe(undefined);

            expect(findOneSpy).toBeCalledTimes(1);
            expect(findOneSpy).toBeCalledWith({id: 1, deleted: false});
        });

        it('should throw an error if warehouse does not exist', async () => {
            jest.spyOn(warehouseRepository, 'findOneBy')
                .mockResolvedValue(undefined);

            expect(warehouseService.delete(1))
                .rejects
                .toThrowError();
        });
    });

    describe('findAll', () => {
        it('should return a list of paginated warehouses', async () => {
            const whereSpy = jest.spyOn(selectQb, 'where')
                .mockReturnValue(selectQb);

            mockedPaginate.mockResolvedValue({
                first: 1, last: 1, total: 5, limit: 5, data: []
            });

            expect(warehouseService.findAll({ limit: 5, currentPage: 1 }
                )).resolves.toEqual({
                    data: [],
                    first: 1,
                    last: 1,
                    limit: 10,
                    total: 10
                });

            expect(whereSpy).toBeCalledTimes(1);
            expect(whereSpy).toBeCalledWith(
                'deleted = :deleted', { deleted: false }
            );

            expect(mockedPaginate).toBeCalledTimes(1);
            expect(mockedPaginate).toBeCalledWith(
                selectQb,
                { currentPage: 1, limit: 5 }
            );
        });
     });
});