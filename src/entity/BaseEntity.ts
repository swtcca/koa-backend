import { 
  Entity, 
  BaseEntity, 
  CreateDateColumn, 
  UpdateDateColumn,
  PrimaryGeneratedColumn, 
} from "typeorm";

@Entity()
export class Base extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    /** 创建时间 */
    @CreateDateColumn() createdAt: string

    /** 更新时间 */
    @UpdateDateColumn() updatedAt: string

}