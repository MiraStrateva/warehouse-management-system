import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import {PaginateOptions, paginate} from "./../pagination/paginator";
import { PaginatedProducts } from "./models/product.types";
import { ProductCreateInput } from "./models/product.inputs";

export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>
    ){}

    async findAll(input: PaginateOptions): Promise<PaginatedProducts> {
        return await paginate<Product, PaginatedProducts>(
            this.productsRepository.createQueryBuilder(),
            PaginatedProducts,
            input
        );
    }

    async findOne(id: number): Promise<Product | undefined> {
        const product = await this.productsRepository.findOneBy({id: id});
        if (!product) {
            throw new NotFoundException();
        }

        return product;
    }

    async create(product: ProductCreateInput): Promise<Product> {
        return await this.productsRepository.save(new Product(product));
    }

    async update(id: number, inproduct: Product): Promise<Product> {
        if (await this.findOne(id)) {        
            await this.productsRepository.update(id, inproduct);
            return await this.findOne(id);
        }
    }

    async delete(id: number): Promise<void> {
        if (await this.findOne(id)) {
            await this.productsRepository.delete(id);
        }
    }
}