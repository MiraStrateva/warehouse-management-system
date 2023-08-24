import { Repository } from "typeorm";
import { ProductEntity } from "./product.entity";
import { ProductService } from "./product.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test } from "@nestjs/testing";
import { ProductCreateInput, ProductEditInput } from "./models/product.inputs";

describe('ProductService', () => {
    let productService: ProductService;
    let productRepository: Repository<ProductEntity>;
    let selectQb;

    beforeEach(async () => {
        selectQb = {
            limit: jest.fn(),
            offset: jest.fn(),
            getMany: jest.fn(),
            getCount: jest.fn()
        };

        const module = await Test.createTestingModule({
            providers: [
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
                }
            ]
        }).compile();

        productService = module.get<ProductService>(ProductService);
        productRepository = module.get<Repository<ProductEntity>>(
            getRepositoryToken(ProductEntity)
        );
    });

    describe('findAll', () => {
        it('should return a list of products', async () => {
            const createQueryBuilderSpy = jest.spyOn(productRepository, 'createQueryBuilder');
            const limitSpy = jest.spyOn(selectQb, 'limit').mockReturnValue(selectQb);
            const offsetSpy = jest.spyOn(selectQb, 'offset').mockReturnValue(selectQb);
            const getManySpy = jest.spyOn(selectQb, 'getMany')
                    .mockResolvedValue([{ id: 1, name: 'PRD 1' } as ProductEntity]);
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
                    first: 1, last: 1, total: 1, limit: 10, data: [{ id: 1, name: 'PRD 1' } as ProductEntity]
                })          
            }));  

            expect(productService.findAll({ currentPage: 1, limit: 10, total: true }))
                .resolves
                .toEqual({
                    first: 1, last: 1, total: 1, limit: 10, data: [{ id: 1, name: 'PRD 1' } as ProductEntity]
                });
            
            expect(createQueryBuilderSpy).toBeCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('should return a product', async () => {
            const repoFindOneBySpy = jest.spyOn(productRepository, 'findOneBy')
                .mockResolvedValue({ id: 1, name: "PRD 1" } as ProductEntity);

            expect(productService.findOne(1))
                .resolves
                .toEqual({ id: 1, name: 'PRD 1' } as ProductEntity);

            expect(repoFindOneBySpy).toBeCalledTimes(1);
        });

        it('should throw an error if product does not exist', async () => {
            jest.spyOn(productRepository, 'findOneBy')
                .mockResolvedValue(undefined);

            expect(productService.findOne(1))
                .rejects
                .toThrowError();
        });
    });

    describe('create', () => {
        it('should create a product', async () => {
            const repoSaveSpy = jest.spyOn(productRepository, 'save')
                .mockResolvedValue({ id: 1, name: "PRD 1" } as ProductEntity);
            const input = new ProductCreateInput();   
            input.name = 'PRD 1';

            expect(productService.create(input))
                .resolves
                .toEqual({ id: 1, name: 'PRD 1' } as ProductEntity);

            expect(repoSaveSpy).toBeCalledTimes(1);
        });
    });

    describe('update', () => {
        it('should update a product', async () => {
            const repoFindOneBySpy = jest.spyOn(productRepository, 'findOneBy')
                .mockResolvedValue({ id: 1, name: "PRD 1" } as ProductEntity);
            const repoSaveSpy = jest.spyOn(productRepository, 'save')
                .mockResolvedValue({ id: 1, name: "PRD 1", description: "Product 1" } as ProductEntity);

            const result = await productService.update(1, new ProductEditInput({ id: 1, description: 'Product 1' }));
            
            expect(result)
                .toEqual({ id: 1, name: "PRD 1", description: 'Product 1' } as ProductEntity);
            expect(repoFindOneBySpy).toBeCalledTimes(1);
            expect(repoSaveSpy).toBeCalledTimes(1);
        });

        it('should throw an error if product does not exist', async () => {
            jest.spyOn(productRepository, 'findOneBy')
                .mockResolvedValue(undefined);

            expect(productService
                .update(1, new ProductEntity({ id: 1, name: 'New name' })))
                .rejects
                .toThrowError();
        });
    });

    describe('delete', () => {
        it('should delete a product', async () => {
            const softDeleteSpy = jest.spyOn(productRepository, 'softDelete')
                .mockResolvedValue(undefined);

            const result = await productService.delete(1);
            
            expect(result).toBe(undefined);
            expect(softDeleteSpy).toBeCalledTimes(1);
            expect(softDeleteSpy).toBeCalledWith(1);
        });
    });
});