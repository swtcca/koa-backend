import { File } from "./File";
import { Base } from "./BaseEntity";
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class User extends Base {

  @Column()
  name: string;

  @Column()
  password: string;

  @OneToOne(type => File)
  @JoinColumn()
  userIcon: File;

  @OneToOne(type => File)
  @JoinColumn()
  test: File;

}