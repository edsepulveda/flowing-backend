import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Users } from '../../users/entities/user.entity'


@Entity('trusted_devices')
export class TrustedDevice  {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Users, user => user.devices)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ length: 255 })
  deviceId: string;

  @Column({ length: 255, nullable: true })
  deviceName: string;

  @Column({ length: 255, nullable: true })
  browser: string;

  @Column({ length: 255, nullable: true })
  os: string;

  @Column({ length: 255, nullable: true })
  ip: string;

  @Column({ type: 'boolean', default: true })
  isTrusted: boolean;

  @Column({ length: 255, nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  refreshTokenExpiresAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

}
