import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Catch, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';

@Catch(EntityNotFoundError)
export class EntityNotFoundErrorFilter implements GqlExceptionFilter{
    catch(exception: any, host: ArgumentsHost) {
        GqlArgumentsHost.create(host);

        return new NotFoundException('Entity not found');
    }
}