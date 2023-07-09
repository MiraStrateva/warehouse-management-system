import { Repository, UpdateResult } from "typeorm";
import { WarehouseService } from "./warehouse.service";
import { WarehouseEntity } from "./warehouse.entity";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { WarehouseCreateInput } from "./models/warehouse.inputs";

describe('WarehouseService', () => {	
    let warehouseService: WarehouseService;
    let warehouseRepository: Repository<WarehouseEntity>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                WarehouseService, 
                {
                    provide: getRepositoryToken(WarehouseEntity),
                    useValue: {
                        findOneBy: jest.fn(), 
                        update: jest.fn(),
                        save: jest.fn(),
                        where: jest.fn(),
                        execute: jest.fn()
                    }
                }
            ]
        }).compile();

        warehouseService = module.get<WarehouseService>(WarehouseService);
        warehouseRepository = module.get<Repository<WarehouseEntity>>(
            getRepositoryToken(WarehouseEntity)
        );
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
            const repoUpdateSpy = jest.spyOn(warehouseRepository, 'update')
                .mockResolvedValue(new UpdateResult());

            expect(warehouseService
                .update(1, new WarehouseEntity({ id: 1, name: 'WHS 1' })))
                .resolves
                .toEqual({ id: 1, name: 'WHS 1' } as WarehouseEntity);
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
                .mockImplementation((): any => new WarehouseEntity({ id: 1, name: 'WHS 1' }));
            const updateSpy = jest.spyOn(warehouseRepository, 'update')
                .mockImplementation((): any => new UpdateResult());

            expect(warehouseService
                .delete(1))
                .resolves
                .toEqual(undefined);

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
});