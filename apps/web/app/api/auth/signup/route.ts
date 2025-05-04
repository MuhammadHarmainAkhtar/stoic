import { NextRequest } from 'next/server';
import { handleSignup } from '../../../../src/features/auth/services/api';

export async function POST(req: NextRequest) {
  return handleSignup(req);
}