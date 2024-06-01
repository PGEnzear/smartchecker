import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
 
@Entity()
export class UserSession {
  @PrimaryGeneratedColumn("uuid")
  readonly uuid: string

  @Column({ nullable: true })
  device?: string;

  @Column({ nullable: true })
  confirmed?: boolean

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    persistence: false,
    nullable: false,
  })
  @JoinColumn()
  user: User

  @CreateDateColumn()
  created: Date;
}