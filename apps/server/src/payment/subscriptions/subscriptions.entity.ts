import { TelegramUser } from 'src/users';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryColumn()
  readonly userId: number;

  @JoinColumn({ name: 'userId' })
  @OneToOne(() => TelegramUser, {
    cascade: true,
    onDelete: 'CASCADE',
    persistence: false,
  })
  telegramUser: TelegramUser;

  @Column()
  subscriptionId: number;

  @Column() 
  expired: Date;

  @CreateDateColumn()
  created: Date;
}
