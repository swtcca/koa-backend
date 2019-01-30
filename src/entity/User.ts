import { File } from "./File";
import { Base } from "./BaseEntity";
import * as md5 from 'md5';
import {isEmpty} from 'lodash';
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class User extends Base {

  constructor(user: User){
    super();
    if(user && !isEmpty(user)){
      this.name = user.name;
      this.password = md5(user.password)
    }
  }

  @Column({
    unique: true
  })
  name: string;

  @Column({
    nullable: false
  })
  password: string;

  @OneToOne(type => File)
  @JoinColumn()
  userIcon: File;

  @OneToOne(type => File)
  @JoinColumn()
  test: File;

}