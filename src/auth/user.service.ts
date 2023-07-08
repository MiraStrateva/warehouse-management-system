import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserInput } from './models/user.input';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async create(userInput: UserInput): Promise<UserEntity> {
    return await this.userRepository.save(
      new UserEntity({
        ...userInput,
        password: await this.authService.hashPassword(userInput.password),
      }),
    );
  }
}