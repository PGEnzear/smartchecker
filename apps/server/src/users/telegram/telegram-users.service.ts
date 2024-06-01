import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { TelegramUser } from './telegram-user.entity';
import { Transactional } from 'typeorm-transactional';
import { UsersService } from '../web/users.service';

@Injectable()
export class TelegramUsersService {
  constructor(
    @InjectRepository(TelegramUser)
    private telegramUsersRepo: Repository<TelegramUser>,
    private usersService: UsersService,
  ) {}

  findOneByUsernameOrID(id: number, username: string) {
    return this.telegramUsersRepo.findOneBy([{ id: id || undefined }, { username: username }]);
  }

  findOneByID(id: number) {
    return this.telegramUsersRepo.findOne({ where: { id } });
  }

  findOne(where: FindOptionsWhere<TelegramUser> | FindOptionsWhere<TelegramUser>[]) {
    return this.telegramUsersRepo.findOne({ where });
  }

  find(where: FindOptionsWhere<TelegramUser> | FindOptionsWhere<TelegramUser>[]) {
    return this.telegramUsersRepo.find({ where });
  }

  deleteByID(id: number) {
    return this.telegramUsersRepo.delete({ id });
  }

  updateByID(id: number, partial: DeepPartial<TelegramUser>) {
    return this.telegramUsersRepo.update({ id }, partial);
  }

  updateByUsername(username: string, partial: DeepPartial<TelegramUser>) {
    return this.telegramUsersRepo.update({ username }, partial);
  }

  @Transactional()
  async createOrUpdate(id: number, partial: DeepPartial<TelegramUser>, ctx?: any) {
    await this.telegramUsersRepo
      .createQueryBuilder()
      .insert()
      .values({ id, ...partial })
      .orUpdate(['active', 'username'], ['id'])
      .execute();

    const telegramUser = await this.findOneByID(id);
    if (!(await this.usersService.findByTelegramID(id))) await this.usersService.create({ telegramUser });

    return telegramUser;
  }
}
