import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Wallet } from "./wallet.entity";
import { Network } from "src/crypto";

@Entity()
export class WalletBalance {
  @ManyToOne(() => Wallet, {
    onDelete: 'CASCADE',
    persistence: false,
    nullable: false,
  })
  @JoinColumn()
  wallet: Wallet;

  @PrimaryColumn()
  derivationPath: string;

  @Column()
  address: string;

  @PrimaryColumn()
  walletMnemonicHash: string

  @PrimaryColumn()
  walletUserId: number

  @Column()
  network: Network

  @Column("double")
  balance: number

  @CreateDateColumn()
  created: Date
}