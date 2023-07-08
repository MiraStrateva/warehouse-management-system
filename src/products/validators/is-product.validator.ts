import { Injectable, Logger } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../product.entity';
import { Repository } from 'typeorm';

@ValidatorConstraint({ name: 'isProduct', async: true })
@Injectable()
export class IsProductValidator implements ValidatorConstraintInterface {
  private readonly logger = new Logger(IsProductValidator.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>
  ) {}

  async validate(id: number): Promise<boolean> {
    
    this.logger.debug(`Validating product with ID: ${id}`);

    const product = await this.productsRepository.findOneBy({id: id, deleted: false});

    this.logger.debug(product);
    return !!product;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return `The product with ID '${validationArguments.value}' does not exist in the table`;
  }
}

export function IsProduct(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsProduct',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsProductValidator,
      async: true,
    });
  };
}