import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params);
}
export async function POST(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params);
}
export async function PUT(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params);
}
export async function PATCH(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params);
}
export async function DELETE(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params);
}

async function forward(req: Request, params: { path: string[] }) {
  const url = new URL(req.url);
  const target = `${API}/${params.path.join("/")}${url.search || ""}`;

  // читаем токен из cookie
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

  // пробросим только нужные заголовки
  const headers: Record<string, string> = {};
  const ctype = req.headers.get("content-type");
  const idem = req.headers.get("idempotency-key");
  if (ctype) headers["content-type"] = ctype;
  if (idem) headers["idempotency-key"] = idem;
  if (token) headers["authorization"] = `Bearer ${token}`;

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
  };

  const resp = await fetch(target, init);
  const body = await resp.arrayBuffer();

  return new NextResponse(body, {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") ?? "application/json" },
  });
}
