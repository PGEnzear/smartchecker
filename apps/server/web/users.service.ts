import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  create(user: DeepPartial<User>) {
    return this.usersRepo.save(user);
  }

  findByTelegramID(id: number) {
    return this.usersRepo.findOneBy({ id });
  }

  findByUUID(uuid: string) {
    return this.usersRepo.findOneBy({ uuid });
  }

  update(id: number, partial: DeepPartial<User>) {
    return this.usersRepo.update({ id }, partial);
  }

  async regenerateUUID(id: number) {
    const uuid = uuidv4();
    await this.update(id, { uuid });
    return uuid;
  }
}
