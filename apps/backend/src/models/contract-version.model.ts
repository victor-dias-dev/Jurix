import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ContractStatus } from '@jurix/shared-types';
import { User } from './user.model';
import { Contract } from './contract.model';

@Table({
  tableName: 'contract_versions',
  timestamps: false,
  underscored: true,
})
export class ContractVersion extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Contract)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'contract_id',
  })
  declare contractId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare version: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.ENUM(...Object.values(ContractStatus)),
    allowNull: false,
  })
  declare status: ContractStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'changed_by_id',
  })
  declare changedById: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'change_reason',
  })
  declare changeReason: string | null;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @BelongsTo(() => Contract, 'contractId')
  declare contract: Contract;

  @BelongsTo(() => User, 'changedById')
  declare changedBy: User;
}
