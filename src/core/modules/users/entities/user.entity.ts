import { Exclude } from 'class-transformer';
import { hashPassword, needsRehash } from 'src/common/utils/password.utils';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { TrustedDevice } from '../../devices/entities/device.entity';
import { Workflow } from '../../workflows/entities/workflow.entity';

export enum AccountType {
  Google = 'google',
  Github = 'github',
  Email = 'email',
  Magic = 'magic',
}

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, type: 'varchar' })
  name: string;

  @Column({ length: 100, type: 'varchar' })
  lastName: string;

  @Column({ length: 100, type: 'varchar', unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.Email,
  })
  accountType: AccountType;

  @Column({ nullable: true, select: false })
  @Exclude()
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false, type: 'boolean' })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => TrustedDevice, device => device.user)
  devices: TrustedDevice[];

  @OneToMany(() => Workflow, workflow => workflow.user)
  workflows: Workflow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashingPassword() {
    if (this.password && !this.password.startsWith('$argon2')) {
      this.password = await hashPassword(this.password);
    }
  }

  async checkPasswordRehash(password: string): Promise<boolean> {
    if (password) return false;
    return await needsRehash(password);
  }

  toJSON() {
    const { ...userObject } = this;
    return userObject;
  }

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }
}
