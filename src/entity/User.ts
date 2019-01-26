import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import { File } from "./File";
import { Base } from "./BaseEntity";

@Entity()
export class User extends Base {

  @Column()
  name: string;

  @Column()
  password: string;

  @OneToOne(type => File)
  @JoinColumn()
  userIcon: File;

}