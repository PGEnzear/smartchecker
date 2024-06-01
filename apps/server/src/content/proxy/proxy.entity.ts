import { User } from "src/users";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Proxy {
  @PrimaryGeneratedColumn("uuid")
  readonly uuid: string

  @Column()
  ip: string

  @Column()
  port: number

  @Column({ nullable: true })
  username?: string

  @Column({ nullable: true })
  password?: string

  @JoinColumn()
  @ManyToOne(() => User, {
    cascade: true,
    onDelete: 'CASCADE',
    persistence: false,
  })
  user: User;

  @CreateDateColumn()
  created: Date

  constructor(ip: string, port: number, username?: string, password?: string) {
    this.ip = ip
    this.port = port
    this.username = username
    this.password = password
  }
}