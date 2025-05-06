import { NextRequest } from 'next/server';
import { handleVerifyForgotPasswordToken } from '../../../../src/features/auth/services/api';

export async function PATCH(req: NextRequest) {
  return handleVerifyForgotPasswordToken(req);
}