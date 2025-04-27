import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountType, Users } from '../entities/user.entity';
import { BaseRepository } from '../../../database/abstract/repository.abstract';

@Injectable()
export class UserRepository extends BaseRepository<Users> {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {
    super(Users, userRepository, 'users');
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<Users | null> {
    try {
      const queryBuilder = this.createQueryBuilder('users');
      
      if (includePassword) {
        queryBuilder.addSelect('users.password');
      }
      
      return queryBuilder
        .where('users.email = :email', { email })
        .getOne();
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findActiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Users[], number]> {
    try {
      const queryBuilder = this.createQueryBuilder('users');

      queryBuilder
        .where('users.isActive = :isActive', { isActive: true })
        .orderBy('users.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      return await queryBuilder.getManyAndCount();
    } catch (error) {
      this.logger.error(
        `Error finding active users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByEmailWithPassword(email: string): Promise<Users | null> {
    return this.findByEmail(email, true);
  }


  async setUserActiveStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      const result = await this.update(userId, { isActive });
      return result;
    } catch (error) {
      this.logger.error(`Error updating user active status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByAccountType(accountType: AccountType, page: number = 1, limit: number = 10): Promise<[Users[], number]> {
    try {
      const queryBuilder = this.createQueryBuilder('users');
      
      queryBuilder
        .where('users.accountType = :accountType', { accountType })
        .orderBy('users.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      return await queryBuilder.getManyAndCount();
    } catch (error) {
      this.logger.error(`Error finding users by account type: ${error.message}`, error.stack);
      throw error;
    }
  }


  async deleteUserAccount(id: string) {
    try {
      const result = await this.deleteBy({ id });
      return result;
    } catch (error) {
      this.logger.error(`Error deleting user account: ${error.message}`, error.stack);
      throw error;
    }
  }

  async setEmailVerified(userId: string): Promise<boolean> {
    try {
      const result = await this.update(userId, { isEmailVerified: true });
      return result;
    } catch (error) {
      this.logger.error(`Error verifying user email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      const result = await this.update(userId, { lastLoginAt: new Date() });
      return result;
    } catch (error) {
      this.logger.error(`Error updating last login date: ${error.message}`, error.stack);
      throw error;
    }
  }
}
