import { User } from 'src/users';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { WalletTask } from './wallet-task.entity';

@Entity()
export class Wallet {
  @PrimaryColumn()
  mnemonic_hash: string;

  @PrimaryColumn()
  userId: number

  @Column()
  mnemonic: string;

  @Column("double")
  balance: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE', 
    persistence: false,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => WalletTask, {
    onDelete: 'SET NULL', 
    persistence: false,
    nullable: true,
  })
  task: WalletTask;

  @Column({ nullable: true })
  taskUuid: string

  @CreateDateColumn()
  created: Date;
}
