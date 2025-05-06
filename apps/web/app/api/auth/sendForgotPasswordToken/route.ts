import { NextRequest } from 'next/server';
import { handleSendForgotPasswordToken } from '../../../../src/features/auth/services/api';

export async function PATCH(req: NextRequest) {
  return handleSendForgotPasswordToken(req);
}