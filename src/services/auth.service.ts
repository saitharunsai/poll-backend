import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CreateUserDto, LoginDto } from '@schemas/user.schema';
import { HttpException } from '@exceptions/httpException';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@config';

const prisma = new PrismaClient();

export class AuthService {
  public async signup(userData: CreateUserDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const findUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await prisma.user.create({ data: { ...userData, password: hashedPassword } });

    const { accessToken, refreshToken } = await this.generateTokens(createUserData.id);

    return { accessToken, refreshToken, user: createUserData };
  }

  public async login(userData: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const findUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

    const { accessToken, refreshToken } = await this.generateTokens(findUser.id);

    return { accessToken, refreshToken, user: findUser };
  }

  public async logout(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!refreshToken || new Date() > refreshToken.expiresAt) {
      throw new HttpException(401, 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: refreshToken.userId } });
    if (!user) throw new HttpException(404, 'User not found');

    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });

    return this.generateTokens(user.id);
  }

  private async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }
}
