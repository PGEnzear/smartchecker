import { TelegramUser } from "src/users";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => TelegramUser, {
    cascade: true,
    onDelete: 'CASCADE',
    persistence: false,
  })
  telegramUser: TelegramUser;

  @Column() 
  subscriptionId: number;

  @CreateDateColumn()
  created: Date;
}