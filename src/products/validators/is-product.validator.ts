import { Inject, Injectable, Logger } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ProductService } from '../product.service';

@ValidatorConstraint({ name: 'isProduct', async: true })
@Injectable()
export class IsProductValidator implements ValidatorConstraintInterface {
  private readonly logger = new Logger(IsProductValidator.name);

  constructor(
    @Inject(ProductService)
    private readonly productService: ProductService,
  ) {}

  async validate(id: any, validationArguments: ValidationArguments): Promise<boolean> {
    
    this.logger.debug(`Validating product with ID: ${id}`);

    const product = await this.productService
              .findOne(id);

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