import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UserRole } from './enum/userRole.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check for existing email first
    const emailExists = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Then check for existing username
    const usernameExists = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (usernameExists) {
      throw new ConflictException('Username already exists');
    }

    // If checks pass, create the user
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  // users.service.ts
  async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const adminUsername = 'admin';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminUser = this.userRepository.create({
        username: adminUsername,
        email: adminEmail,
        password: 'admin123',
        role: UserRole.ADMIN,
      });

      await this.userRepository.save(adminUser);
      console.log('✅ Admin user seeded');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  }

  async findByProperty(property: string, value: any): Promise<User | null> {
    const result = this.userRepository.findOne({ where: { [property]: value } });
    console.log('object', result);

    return result;
  }
}
