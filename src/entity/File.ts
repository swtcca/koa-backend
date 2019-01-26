import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Base } from "./BaseEntity";

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