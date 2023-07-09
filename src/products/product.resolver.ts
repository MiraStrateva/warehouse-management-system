import { Logger } from "@nestjs/common";
import { ProductService } from "./product.service";
import { PaginatedProducts, Product } from './models/product.types';
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PaginateOptionsInput } from "../pagination/models/paginate-options.input";
import { ProductCreateInput, ProductEditInput } from "./models/product.inputs";
import { EntityWithId } from '../app.types';

@Resolver(() => Product)
export class ProductResolver{

    private readonly logger = new Logger(ProductResolver.name);

    constructor (
        private readonly productService: ProductService
    ) {}

    @Query(() => PaginatedProducts, { name: 'productsList', nullable: true })    
    public async products(
        @Args('input', { type: () => PaginateOptionsInput })
        input: PaginateOptionsInput
    ): Promise<PaginatedProducts>{
        return await this.productService.findAll(input);
    }

    @Query(() => Product, { name: 'productInfo', nullable: true })       
    public async product(
        @Args('id', {type: () => Int})
        id: number
    ): Promise<Product>{
        return await this.productService.findOne(id);
    }

    @Mutation(() => Product, { name: 'createProduct' })
    public async create(
        @Args('input', {type: () => ProductCreateInput}
        ) input: ProductCreateInput
    ): Promise<Product>{
        return await this.productService.create(input);
    }

    @Mutation(() => Product, { name: 'editProduct' })
    public async edit(
        @Args('id', {type: () => Int})
        id: number,
        @Args('input', { type: () => ProductEditInput })
        input: ProductEditInput        
    ): Promise<Product>{
        const product = await this.productService.findOne(id);
        return await this.productService.update(id, Object.assign(product, input));
    }

    @Mutation(() => EntityWithId, { name: 'deleteProduct' }) 
    public async delete(
        @Args('id', {type: () => Int})
        id: number
    ): Promise<EntityWithId>{
        await this.productService.delete(id);
        return new EntityWithId(id);
    }
}