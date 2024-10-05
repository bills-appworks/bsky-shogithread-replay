import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  return NextResponse.json({ version: process.env.APP_VERSION });
}
