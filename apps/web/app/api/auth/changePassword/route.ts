import { NextRequest } from 'next/server';
import { handleChangePassword } from '../../../../src/features/auth/services/api';

export async function PATCH(req: NextRequest) {
  return handleChangePassword(req);
}