import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from '@schemas/user.schema';
import { HttpException } from '@exceptions/httpException';
import { hash } from 'bcrypt';
type UserWithoutPassword = Omit<User, 'password'>;

export class UserService {
  public users = new PrismaClient().user;

  public async findAllUsers(): Promise<UserWithoutPassword[]> {
    return this.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser = await this.users.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser = await this.users.findUnique({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData = await this.users.create({ data: { ...userData, password: hashedPassword } });
    return createUserData;
  }

  public async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    const findUser = await this.users.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    if (userData.email) {
      const findUserByEmail = await this.users.findUnique({ where: { email: userData.email } });
      if (findUserByEmail && findUserByEmail.id !== userId) throw new HttpException(409, `This email ${userData.email} already exists`);
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserData = await this.users.update({ where: { id: userId }, data: { ...userData } });
    return updateUserData;
  }

  public async deleteUser(userId: string): Promise<User> {
    const findUser = await this.users.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData = await this.users.delete({ where: { id: userId } });
    return deleteUserData;
  }
}
