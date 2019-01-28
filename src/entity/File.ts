import { Base } from "./BaseEntity";
import { Entity, Column } from "typeorm";

@Entity()
export class File extends Base {

  @Column({
    default: null
  })
  name: string;

  @Column({
    default: null
  })
  url: string;

}