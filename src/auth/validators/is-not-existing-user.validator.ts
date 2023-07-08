import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { Repository } from "typeorm";
import { UserEntity } from "../user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
@ValidatorConstraint({ async: true })
export class IsNotExistingUserValidator
implements ValidatorConstraintInterface {    
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async validate(
        value: any, 
        validationArguments?: ValidationArguments
    ): Promise<boolean> {
        
        const entity = await this.userRepository.findOneBy({
            [validationArguments.property]: value
            }
        );

        return entity === null;
    }

    defaultMessage?(validationArguments?: ValidationArguments): string {
        return `${validationArguments.property} already taken`;
    }
}

export function IsNotExistingUser(validationOptions?: any) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsNotExistingUserValidator
        });
    }
}