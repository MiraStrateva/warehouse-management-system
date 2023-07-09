import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { AuthService } from "./auth.service";
import { AuthResolver } from './auth.resolver';
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import { IsNotExistingUserValidator } from "./validators/is-not-existing-user.validator";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.AUTH_SECRET || 'secret123',
                signOptions: { 
                    expiresIn: '60m' 
                },
            }),
        })],
    providers: [JwtStrategy, AuthService, AuthResolver, UserResolver, UserService, IsNotExistingUserValidator],
})
export class AuthModule {}