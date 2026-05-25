import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://dailyflow-backend-dqou.onrender.com';

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/backend', '/api');
  const search = req.nextUrl.search;
  const url = `${BACKEND_URL}${path}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = req.headers.get('authorization');
  if (authHeader) headers['Authorization'] = authHeader;

  const cookie = req.headers.get('cookie');
  if (cookie) headers['Cookie'] = cookie;

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) init.body = body;
  }

  try {
    const response = await fetch(url, init);
    const data = await response.text();

    const res = new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.headers.set('set-cookie', setCookie);

    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Backend unreachable' },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;