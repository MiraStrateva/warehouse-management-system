import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserInput } from './models/user.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async create(userInput: UserInput): Promise<UserEntity> {
    return await this.userRepository.save(
      new UserEntity({
        ...userInput,
        password: await this.hashPassword(userInput.password),
      }),
    );
  }  

  private async hashPassword(password: string): Promise<string>{
    return await bcrypt.hash(password, 10);
}
}