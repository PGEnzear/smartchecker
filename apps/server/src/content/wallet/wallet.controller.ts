import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseEnumPipe,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth';
import { WalletTasksService } from './wallet-tasks.service';
import { CurrentSession, UserSession } from 'src/users';
import { WalletsService } from './wallet.service';
import { ApiOkPaginatedResponse, ApiPaginationQuery, FilterOperator, Paginate, PaginateQuery } from 'nestjs-paginate';
import { WalletBalanceDto, WalletDto, WalletTaskDto } from './dto';
import { Network } from 'src/crypto';

@Auth()
@Controller('wallets')
@ApiTags('wallets')
export class WalletsController {
  constructor(
    private walletTasksService: WalletTasksService,
    private walletsService: WalletsService,
  ) {}

  @Get()
  @ApiPaginationQuery({
    sortableColumns: ['balance', 'created'],
    searchableColumns: ['mnemonic'],
    filterableColumns: {
      balance: [FilterOperator.GTE, FilterOperator.LTE],
    },
  })
  @ApiOkPaginatedResponse(WalletDto, {
    sortableColumns: ['balance', 'created'],
    searchableColumns: ['mnemonic'],
    filterableColumns: {
      balance: [FilterOperator.GTE, FilterOperator.LTE],
    },
  })
  paginate(@CurrentSession() { user }: UserSession, @Paginate() query: PaginateQuery) {
    return this.walletsService.paginate(query, user.id);
  }

  @Get('balances/:mnemonic_hash')
  @ApiResponse({ type: WalletBalanceDto, isArray: true })
  walletBalance(@Param('mnemonic_hash') mnemonicHash: string, @CurrentSession() { user }: UserSession) {
    return this.walletsService.findWalletBalances(mnemonicHash, user.id);
  }

  @Get('tasks')
  @ApiResponse({ type: WalletTaskDto, isArray: true })
  walletTasks(@CurrentSession() { user }: UserSession) {
    return this.walletTasksService.find(user.id);
  }

  @Delete('tasks/:uuid')
  walletTaskDelete(@CurrentSession() { user }: UserSession, @Param('uuid') uuid: string) {
    return this.walletTasksService.stop(uuid, user.id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 }), new FileTypeValidator({ fileType: 'text/plain' })],
      }),
    )
    file: Express.Multer.File,
    @CurrentSession() { user }: UserSession,
  ) {
    return this.walletTasksService.create(user, file);
  }

  @Get('export')
  exportAll(@CurrentSession() { user }: UserSession) {
    return this.walletsService.exportAll(user.id);
  }

  @Get('exportWithBalances')
  exportWithBalances(@CurrentSession() { user }: UserSession) {
    return this.walletsService.exportWithBalances(undefined, user.id);
  }

  @Get('exportWithBalances/:network')
  exportWithBalancesByNetwork(@CurrentSession() { user }: UserSession, @Param('network', new ParseEnumPipe(Network)) network: Network) {
    return this.walletsService.exportWithBalances(network, user.id);
  }

  @Delete()
  deleteAll(@CurrentSession() { user }: UserSession) {
    return this.walletsService.deleteAll(user.id);
  }
}
