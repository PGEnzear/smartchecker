import { User } from 'src/users';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WalletTask {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    persistence: false,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 0 })
  totalMnemonics: number

  @Column()
  loadedMnemonics: number

  @Column('double', { default: 0 })
  totalBalance: number

  @Column({ nullable: true })
  completed: boolean;

  @CreateDateColumn()
  created: Date;
}
