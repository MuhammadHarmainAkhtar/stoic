import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'your_secret_key';

  return jwt.sign(payload, secret, {
    expiresIn: '1d', // expires in 1 day
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  return jwt.verify(token, secret) as TokenPayload;
};