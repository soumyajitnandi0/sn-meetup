import { NextResponse } from 'next/server';

export async function GET() {
  // Socket.IO is initialized in the custom server
  // This endpoint is just for the path configuration
  return NextResponse.json(
    { message: 'Socket.IO server is running' },
    { status: 200 }
  );
}
