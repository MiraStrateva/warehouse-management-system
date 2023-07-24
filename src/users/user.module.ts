import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { UserResolver } from "../users/user.resolver";
import { UserService } from "../users/user.service";
import { IsNotExistingUserValidator } from "./validators/is-not-existing-user.validator";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity])
    ],
    providers: [UserResolver, UserService, IsNotExistingUserValidator],
})
export class UserModule {}