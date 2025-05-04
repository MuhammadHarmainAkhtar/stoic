import { NextRequest } from 'next/server';
import { handleCheckAvailability } from '../../../../src/features/auth/services/api';

export async function GET(req: NextRequest) {
  return handleCheckAvailability(req);
}