import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { UserSession } from './user-session.entity';
import { UserSessionDto } from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectRepository(UserSession) private userSessionsRepo: Repository<UserSession>,
    private eventEmitter: EventEmitter2,
  ) {}

  findOne(uuid: string, user_id?: number) {
    return this.userSessionsRepo.findOne({
      where: {
        uuid,
        user: {
          id: user_id,
        },
      },
      relations: ['user'],
    });
  }

  confirmSession(uuid: string, user_id?: number) {
    return this.userSessionsRepo.update(
      {
        uuid,
        user: {
          id: user_id,
        },
      },
      { confirmed: true },
    );
  }

  find(user_uuid: string) {
    return this.userSessionsRepo.findBy({
      user: {
        uuid: user_uuid,
      },
      confirmed: true,
    });
  }

  async create(user_id: number, device?: string) {
    var session = new UserSession();
    session = await this.userSessionsRepo.save(
      Object.assign(session, {
        device,
        user: {
          id: user_id,
        },
      }),
    );
    this.eventEmitter.emit('session.create', session);
    return session;
  }

  async deleteOne(uuid: string, user_id?: number) {
    await this.userSessionsRepo.delete({
      uuid,
      ...(user_id
        ? {
            user: {
              id: user_id,
            },
          }
        : undefined),
    });
  }

  async deleteOther(uuid: string, user_id: number) {
    await this.userSessionsRepo.delete({
      uuid: Not(uuid),
      user: {
        id: user_id,
      },
    });
  }

  async delete(user_id: number) {
    await this.userSessionsRepo.delete({
      user: {
        id: user_id,
      },
    });
  }

  toDto(session: UserSession): UserSessionDto {
    return instanceToPlain(new UserSessionDto(session)) as UserSessionDto;
  }
}
