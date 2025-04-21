import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AppLogger } from 'src/core/logger/logger.service';
import { Users } from './entities/user.entity';
import { HttpCatchException } from '../../../common/exceptions/http.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { verifyPassword } from 'src/common/utils/password.utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(createUserDto: CreateUserDto): Promise<Users> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      this.logger.warn(
        `Attempt to create a user with an existing one: ${createUserDto.email} - email in the database: ${existingUser.email}`,
      );
      throw HttpCatchException.conflict(
        `A user with the email ${createUserDto.email} already exists in our database. Try with another one`,
      );
    }

    this.logger.debug(`Successfully created a user`);
    return this.userRepository.create(createUserDto);
  }

  async findUserById(id: string): Promise<Users | null> {
    try {
      return await this.userRepository.findOneById(id);
    } catch (error) {
      this.logger.error(
        `User with the id ${id} doesnt exists: ${error.message}`,
        error.stack,
      );
      throw HttpCatchException.notFound(`User with the id ${id} doesnt exists`);
    }
  }

  async findOneById(id: string): Promise<Users> {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      throw HttpCatchException.notFound(`User with id ${id} not found`);
    }

    return user;
  }

  async findOneByEmailWithPassword(email: string): Promise<Users> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw HttpCatchException.notFound(`User with email ${email} not found`);
    }

    return user;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const user = await this.userRepository.findByEmailWithPassword(
      (await this.findOneById(id)).email,
    );

    const isCurrentPasswordValid = await verifyPassword(
      user.password,
      changePasswordDto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw HttpCatchException.badRequest('Current password is incorrect');
    }

    if (await user.checkPasswordRehash(changePasswordDto.newPassword)) {
      this.logger.debug(`Password for user ${id} needs rehashing`);
    }

    return this.userRepository.update(id, {
      password: changePasswordDto.newPassword,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Users> {
    const user = await this.findOneById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );

      if (existingUser) {
        throw HttpCatchException.conflict(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOneById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneById(id);

    if (!user) {
      throw HttpCatchException.notFound('User not found');
    }

    this.userRepository.delete(id);
  }

  async enableUser(id: string): Promise<Users> {
    await this.userRepository.setUserActiveStatus(id, true);
    return this.findOneById(id);
  }

  async disableUser(id: string): Promise<Users> {
    await this.userRepository.setUserActiveStatus(id, false);
    return this.findOneById(id);
  }

  async setEmailVerified(id: string): Promise<Users> {
    await this.userRepository.setEmailVerified(id);
    return this.findOneById(id);
  }
}
