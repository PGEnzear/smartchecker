import { ClassSerializerInterceptor, Injectable, StreamableFile, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet, WalletBalance } from './entity';
import { MoreThan, Repository } from 'typeorm';
import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';
import { Network } from 'src/crypto';
import { EOL } from 'os';
import { Readable } from 'stream';
import * as _ from 'lodash';
import { instanceToPlain } from 'class-transformer';
import { WalletBalanceDto } from './dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletsRepo: Repository<Wallet>,
    @InjectRepository(WalletBalance) private walletBalanceRepo: Repository<WalletBalance>,
  ) {}

  paginate(query: PaginateQuery, userId?: number) {
    return paginate(query, this.walletsRepo, {
      sortableColumns: ['balance', 'created'],
      where: {
        ...(userId ? { userId } : {}),
      },
      defaultSortBy: [['created', 'DESC']],
      searchableColumns: ['mnemonic'],
      select: ['mnemonic_hash', 'mnemonic', 'balance', 'created'],
      filterableColumns: {
        balance: [FilterOperator.GTE, FilterOperator.LTE],
      },
    });
  }

  async findWalletBalances(walletMnemonicHash: string, userId?: number) {
    const walletBalances = await this.walletBalanceRepo.find({
      where: {
        walletMnemonicHash,
        ...(userId ? { walletUserId: userId } : {}),
      },
      order: {
        network: "ASC"
      }
    });

    return walletBalances.map((i) => instanceToPlain(new WalletBalanceDto(i)));
  }

  async deleteAll(userId: number) {
    await this.walletsRepo.delete({ userId });
  }

  async exportAll(userId: number) {
    const wallets = await this.walletsRepo.find({ where: { userId }, select: ['mnemonic'] });
    const stream = Readable.from(_.uniq(wallets.map(({ mnemonic }) => mnemonic)).join(EOL));

    return new StreamableFile(stream);
  }

  async exportWithBalances(network?: Network, userId?: number) {
    const wallets = await this.walletBalanceRepo.find({
      where: { ...(userId ? { walletUserId: userId } : {}), network, balance: MoreThan(0) },
      relations: ['wallet'],
    });
    const stream = Readable.from(_.uniq(wallets.map(({ wallet }) => wallet.mnemonic)).join(EOL));

    return new StreamableFile(stream);
  }
}
