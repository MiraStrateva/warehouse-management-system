import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService{
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ){}

    public getTokenForUser(user: UserEntity): string {
        this.logger.log(`Generating token for user ${user.username}`);
        
        return this.jwtService.sign({
            username: user.username,
            sub: user.id
        });
    }

    public async validateUser(username: string, password: string): Promise<UserEntity>{
        this.logger.log(`Validating user ${username}`);

        const user = await this.userRepository.findOne({
            where: {username}
        });

        if(!user){
            this.logger.log(`User ${username} not found!`);
            throw new UnauthorizedException();
        }

        if(!(await bcrypt.compare(password, user.password))){
            this.logger.log(`Invalid credentials for user ${username}`);
            throw new UnauthorizedException();
        }

        return user;
    }

    public async hashPassword(password: string): Promise<string>{
        return await bcrypt.hash(password, 10);
    }
}
