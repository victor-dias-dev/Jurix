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
import { AuditAction } from '@jurix/shared-types';
import { User } from './user.model';

export type EntityType = 'CONTRACT' | 'USER' | 'AUTH';

@Table({
  tableName: 'audit_logs',
  timestamps: false,
  underscored: true,
})
export class AuditLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(AuditAction)),
    allowNull: false,
  })
  declare action: AuditAction;

  @Column({
    type: DataType.ENUM('CONTRACT', 'USER', 'AUTH'),
    allowNull: false,
    field: 'entity_type',
  })
  declare entityType: EntityType;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'entity_id',
  })
  declare entityId: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata: Record<string, unknown> | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'ip_address',
  })
  declare ipAddress: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'user_agent',
  })
  declare userAgent: string | null;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @BelongsTo(() => User, 'userId')
  declare user: User;
}
