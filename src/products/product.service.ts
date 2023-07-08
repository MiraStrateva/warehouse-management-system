import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PaginateOptions, paginate } from "./../pagination/paginator";
import { PaginatedProducts } from "./models/product.types";
import { ProductCreateInput, ProductEditInput } from "./models/product.inputs";

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productsRepository: Repository<ProductEntity>
    ){}

    async findAll(input: PaginateOptions): Promise<PaginatedProducts> {
        return await paginate<ProductEntity, PaginatedProducts>(
            this.productsRepository.createQueryBuilder()
                .where("deleted = :deleted", { deleted: false }),
            PaginatedProducts,
            input
        );
    }

    async findOne(id: number): Promise<ProductEntity | undefined> {
        this.logger.debug(`findOne: ${id}`);
        const product = await this.productsRepository.findOneBy({id: id, deleted: false});
        if (!product) {
            throw new NotFoundException();
        }

        return product;
    }

    async create(input: ProductCreateInput): Promise<ProductEntity> {
        return await this.productsRepository.save(new ProductEntity(input));
    }

    async update(id: number, input: ProductEditInput): Promise<ProductEntity> {
        if (await this.findOne(id)) {        
            await this.productsRepository.update(id, input);
            return await this.findOne(id);
        }
    }

    async delete(id: number): Promise<void> {
        const product = await this.findOne(id);
        product.deleted = true;
        await this.productsRepository.update(id, product);
    }
}