import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CoinGeckoClient } from 'coingecko-api-v3';

export enum CoinGeckoCrypto {
  Bitcoin = "bitcoin",
  Litecoin = "litecoin",
  BitcoinCash = "bitcoin-cash",
  Solana = "solana",
}

@Injectable()
export class CoinGeckoService implements OnModuleInit {
  private client = new CoinGeckoClient({
    timeout: 10000,
    autoRetry: true,
  });
  private pairs: Partial<Record<CoinGeckoCrypto, number>> = {}

  getRate(id: CoinGeckoCrypto) {
    return this.pairs[id]
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async onModuleInit() {
    const prices = await this.client.simplePrice({
      vs_currencies: "usd",
      ids: Object.values(CoinGeckoCrypto).join(",")
    })
    for (const id in prices) {
      this.pairs[id] = prices[id]?.usd
    }
  }
}