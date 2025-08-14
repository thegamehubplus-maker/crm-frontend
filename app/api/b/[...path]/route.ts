import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(req: NextRequest, context: any) {
  return forward(req, context.params);
}
export async function POST(req: NextRequest, context: any) {
  return forward(req, context.params);
}
export async function PUT(req: NextRequest, context: any) {
  return forward(req, context.params);
}
export async function PATCH(req: NextRequest, context: any) {
  return forward(req, context.params);
}
export async function DELETE(req: NextRequest, context: any) {
  return forward(req, context.params);
}

async function forward(req: NextRequest, params: { path: string[] }) {
  const url = new URL(req.url);
  const target = `${API}/${params.path.join("/")}${url.search || ""}`;

  const token = req.cookies.get("token")?.value;

  const headers: Record<string, string> = {};
  for (const [k, v] of req.headers.entries()) {
    if (["content-type", "idempotency-key"].includes(k.toLowerCase())) headers[k] = v;
  }
  if (token) headers["authorization"] = `Bearer ${token}`;

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
  };

  const resp = await fetch(target, init);
  const body = await resp.arrayBuffer();

  return new NextResponse(body, {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") || "application/json" },
  });
}
