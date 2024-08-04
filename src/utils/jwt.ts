import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@config';

interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const verifyJwt = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const generateJwt = (userId: string, expiresIn: string = '1d'): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};