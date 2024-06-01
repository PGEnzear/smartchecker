import { Injectable, NotFoundException } from '@nestjs/common';
import { ProxyCreateMultipleDTO, ProxyResponseDto } from './dto';
import { User } from 'src/users';
import { Repository } from 'typeorm';
import { Proxy } from './proxy.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import * as _ from 'lodash';

@Injectable()
export class ProxyService {
  constructor(@InjectRepository(Proxy) private readonly proxyRepo: Repository<Proxy>) {}

  private parseProxyString(proxyString: string): Proxy | null {
    const withCredsRegex = /^([^:]+):([^@]+)@([^:]+):(\d+)$/; // Example: username:password@ip:port
    const reversedRegex = /^([^:]+):(\d+):([^:]+):([^:]+)$/; // Example: ip:port:username:password
    const ipPortRegex = /^([^:]+):(\d+)$/; // Example: ip:port

    let match;

    if ((match = withCredsRegex.exec(proxyString))) {
      const [, username, password, ip, portStr] = match;
      const port = parseInt(portStr, 10);
      return new Proxy(ip, port, username, password);
    } else if ((match = reversedRegex.exec(proxyString))) {
      const [, ip, portStr, username, password] = match;
      const port = parseInt(portStr, 10);
      return new Proxy(ip, port, username, password);
    } else if ((match = ipPortRegex.exec(proxyString))) {
      const [, ip, portStr] = match;
      const port = parseInt(portStr, 10);
      return new Proxy(ip, port);
    } else {
      return null;
    }
  }

  async countByUser(id: number) {
    return this.proxyRepo.countBy({
      user: {
        id,
      },
    });
  }

  async findRandomByUser(user_id: number) {
    const proxy = await this.proxyRepo
      .createQueryBuilder('e')
      .leftJoin('e.user', 'user')
      .orderBy('RAND()')
      .where('user.id = :user_id', { user_id })
      .getOne();
    if (!proxy) throw new NotFoundException();

    return proxy;
  }

  async find(user?: User) {
    const proxies = await this.proxyRepo.findBy({
      user: {
        uuid: user.uuid,
      },
    });

    return proxies.map((proxy) => instanceToPlain(new ProxyResponseDto(proxy))) as ProxyResponseDto[];
  }

  async updateProxies(user: User, { items }: ProxyCreateMultipleDTO) {
    // Parsing
    const proxiesArray = _.uniqBy(
      items
        .map((item) => {
          const proxy = this.parseProxyString(item);
          if (!proxy) return undefined;

          proxy.user = user;
          return proxy;
        })
        .filter((proxy) => !!proxy),
      (proxy) => {
        const proxyURL = new URL("socks://" + proxy.ip);
        proxyURL.port = proxy.port.toString();
        proxyURL.username = proxy.username;
        proxyURL.password = proxy.password;
        return proxyURL.toString();
      },
    );

    await this.proxyRepo.delete({
      user: {
        id: user.id,
      },
    });
    const proxiesDB = await this.proxyRepo.save(proxiesArray);

    return proxiesDB.map((item) => instanceToPlain(new ProxyResponseDto(item))) as ProxyResponseDto[];
  }

  async deleteProxy(uuid: string) {
    await this.proxyRepo.delete({ uuid });
  }
}
