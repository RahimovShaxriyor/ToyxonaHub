import { ownersRepository } from './owners.repository.js';
import { hashPassword } from '../../shared/utils/password.js';
import { buildPaginationMetadata, buildPrismaPagination } from '../../shared/utils/pagination.js';
import { ConflictError, NotFoundError } from '../../shared/errors/index.js';

export class OwnersService {
  constructor(repo = ownersRepository) {
    this.repo = repo;
  }

  async createOwner(data) {
    const existingEmail = await this.repo.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await this.repo.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError(
        'A user with this username already exists',
        'USERNAME_ALREADY_EXISTS'
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const owner = await this.repo.createOwner({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      passwordHash: hashedPassword,
      phone: data.phone,
    });

    return owner;
  }

  async listOwners({ page, limit }) {
    const { skip, take } = buildPrismaPagination({ page, limit });
    const { total, items } = await this.repo.listOwners({ skip, take });

    return {
      data: items,
      pagination: buildPaginationMetadata({ page, limit, total }),
    };
  }

  async getOwnerById(id) {
    const owner = await this.repo.findById(id);
    if (!owner) {
      throw new NotFoundError('Owner not found', 'OWNER_NOT_FOUND');
    }
    return owner;
  }
}

export const ownersService = new OwnersService();
