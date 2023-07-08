import { Injectable, Logger } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from '../warehouse.entity';

@ValidatorConstraint({ name: 'isWarehouse', async: true })
@Injectable()
export class IsWarehouseValidator implements ValidatorConstraintInterface {
  private readonly logger = new Logger(IsWarehouseValidator.name);

  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>
  ) {}

  async validate(id: number): Promise<boolean> {
    
    this.logger.debug(`Validating warehouse with ID: ${id}`);

    const warehouse = await this.warehouseRepository.findOneBy({id: id, deleted: false});

    this.logger.debug(warehouse);
    return !!warehouse;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return `The warehouse with ID '${validationArguments.value}' does not exist in the table`;
  }
}

export function IsWarehouse(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsWarehouse',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsWarehouseValidator,
      async: true,
    });
  };
}