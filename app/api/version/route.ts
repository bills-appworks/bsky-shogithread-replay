import { NextRequest, NextResponse } from 'next/server';
import { Version } from '@/app/lib/definition';

export function GET(request: NextRequest) {
  return NextResponse.json({ version: Version });
}
