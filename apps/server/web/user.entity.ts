import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TelegramUser } from '../telegram';

@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ generated: 'uuid', unique: true })
  readonly uuid: string; 

  @JoinColumn({ name: 'id' })
  @OneToOne(() => TelegramUser, {
    cascade: true,
    onDelete: 'CASCADE',
    persistence: false,
  })
  telegramUser: TelegramUser;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
