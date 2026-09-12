import { usersRepository } from './users.repository.js';
import { NotFoundError } from '../../shared/errors/index.js';

export class UsersService {
  constructor(repo = usersRepository) {
    this.repo = repo;
  }

  async getProfile(userId) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found', 'USER_NOT_FOUND');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const existing = await this.repo.findById(userId);
    if (!existing) {
      throw new NotFoundError('User profile not found', 'USER_NOT_FOUND');
    }

    return this.repo.update(userId, updateData);
  }
}

export const usersService = new UsersService();
