import { NextRequest, NextResponse } from "next/server";

const DJANGO_BACKEND_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api/v1";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const search = request.nextUrl.search;
  const targetUrl = search ? `${DJANGO_BACKEND_URL}/${path}/${search}` : `${DJANGO_BACKEND_URL}/${path}/`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, message: "Backend proxy unreachable", errors: err?.message },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const targetUrl = `${DJANGO_BACKEND_URL}/${path}/`;

  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, message: "Backend proxy unreachable", errors: err?.message },
      { status: 502 }
    );
  }
}
