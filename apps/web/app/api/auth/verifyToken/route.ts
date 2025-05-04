import { NextRequest } from 'next/server';
import { handleVerifyEmail } from '../../../../src/features/auth/services/api';

export async function PATCH(req: NextRequest) {
  return handleVerifyEmail(req);
}