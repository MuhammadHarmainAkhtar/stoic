import { NextRequest } from 'next/server';
import { handleLogin } from '../../../../src/features/auth/services/api';

export async function POST(req: NextRequest) {
  return handleLogin(req);
}