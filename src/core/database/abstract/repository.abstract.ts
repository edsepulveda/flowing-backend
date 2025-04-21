import { Logger } from '@nestjs/common';
import {
  Repository,
  EntityTarget,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseRepository<T> {
  create(data: DeepPartial<T>): Promise<T>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findOneById(id: string | number): Promise<T | null>;
  findOneBy(where: FindOptionsWhere<T>): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  update(
    id: string | number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean>;
  updateBy(
    criteria: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean>;
  delete(id: string | number): Promise<boolean>;
  deleteBy(criteria: FindOptionsWhere<T>): Promise<boolean>;
  count(options?: FindManyOptions<T>): Promise<number>;
  createQueryBuilder(alias?: string): SelectQueryBuilder<T>;
}

export abstract class BaseRepository<T> implements BaseRepository<T> {
  protected readonly logger: Logger;

  constructor(
    protected readonly entity: EntityTarget<T>,
    protected readonly repository: Repository<T>,
    protected readonly entityName: string,
  ) {
    this.logger = new Logger(`${entityName}Repository`);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      const saved = await this.repository.save(entity);
      this.logger.debug(`Created ${this.entityName} successfully`);
      return saved;
    } catch (error) {
      this.logger.error(
        `Error creating ${this.entityName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      const entity = await this.repository.findOne(options);
      return entity || null;
    } catch (error) {
      this.logger.error(
        `Error finding ${this.entityName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOneById(id: string | number): Promise<T | null> {
    try {
      const entity = await this.repository.findOneBy({ id } as any);
      return entity || null;
    } catch (error) {
      this.logger.error(
        `Error finding ${this.entityName} by id: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    try {
      const entity = await this.repository.findOneBy(where);
      return entity || null;
    } catch (error) {
      this.logger.error(
        `Error finding ${this.entityName} by criteria: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      return await this.repository.find(options);
    } catch (error) {
      this.logger.error(
        `Error finding all ${this.entityName}s: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string | number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    try {
      const result = await this.repository.update(id, data);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Error updating ${this.entityName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateBy(
    criteria: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    try {
      const result = await this.repository.update(criteria, data);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Error updating ${this.entityName} by criteria: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Error deleting ${this.entityName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteBy(criteria: FindOptionsWhere<T>): Promise<boolean> {
    try {
      const result = await this.repository.delete(criteria);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Error deleting ${this.entityName} by criteria: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      this.logger.error(
        `Error counting ${this.entityName}s: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  createQueryBuilder(
    alias: string = this.entityName.toLowerCase(),
  ): SelectQueryBuilder<T> {
    try {
      return this.repository.createQueryBuilder(alias);
    } catch (error) {
      this.logger.error(
        `Error creating query builder for ${this.entityName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
