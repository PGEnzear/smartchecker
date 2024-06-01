import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TelegramUser {
  @PrimaryColumn('bigint')
  id: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  active: boolean;

  @Column({ nullable: true })
  is_admin: boolean;

  @Column({ nullable: true })
  banned: boolean;

  @UpdateDateColumn()
  updated: Date;

  @CreateDateColumn()
  created: Date;
}