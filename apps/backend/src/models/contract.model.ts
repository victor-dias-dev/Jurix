import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { ContractStatus } from '@jurix/shared-types';
import { User } from './user.model';
import { ContractVersion } from './contract-version.model';

@Table({
  tableName: 'contracts',
  timestamps: true,
  underscored: true,
})
export class Contract extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

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
    defaultValue: ContractStatus.DRAFT,
  })
  declare status: ContractStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'created_by_id',
  })
  declare createdById: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'current_version',
  })
  declare currentVersion: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => User, 'createdById')
  declare createdBy: User;

  @HasMany(() => ContractVersion, 'contractId')
  declare versions: ContractVersion[];
}
