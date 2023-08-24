import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { paginate } from "./../pagination/paginator";
import { PaginatedProducts } from "./models/product.types";
import { ProductCreateInput, ProductEditInput } from "./models/product.inputs";
import { PaginateOptions } from '../pagination/models/paginate-options.input';

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productsRepository: Repository<ProductEntity>
    ){}

    async findAll(input: PaginateOptions): Promise<PaginatedProducts> {
        return await paginate<ProductEntity, PaginatedProducts>(
            this.productsRepository.createQueryBuilder(),
            PaginatedProducts,
            input
        );
    }

    async findOne(id: number): Promise<ProductEntity | undefined> {
        const product = await this.productsRepository.findOneBy({id: id}); 
        if (!product) {
            throw new NotFoundException();
        }

        return product;
    }

    async create(input: ProductCreateInput): Promise<ProductEntity> {
        return await this.productsRepository.save(new ProductEntity(input));
    }

    async update(id: number, input: ProductEditInput): Promise<ProductEntity> {
        const product = await this.findOne(id);
        return this.productsRepository.save(Object.assign(product, input));
    }

    async delete(id: number): Promise<void> {
        await this.productsRepository.softDelete(id);
    }
}