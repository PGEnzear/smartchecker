import { Network } from "src/crypto";

export interface BalanceProcessor {
  network: Network,
  address: string;
  derivationPath: string;
  balance: number;
}
