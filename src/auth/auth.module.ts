import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResolver } from './auth.resolver';
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from '../users/user.module';
import { UserEntity } from '../users/user.entity';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.AUTH_SECRET, 
                signOptions: { 
                    expiresIn: '60m' 
                },
            }),
        }),
        UserModule],
    providers: [JwtStrategy, AuthService, AuthResolver],
})
export class AuthModule {}