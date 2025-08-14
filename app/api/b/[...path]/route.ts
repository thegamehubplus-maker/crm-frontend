import { NextRequest, NextResponse } from "next/server";

// Base URL of the backend API. This is pulled from environment variables so
// that the same code can be deployed to different backends by changing
// NEXT_PUBLIC_API_URL. For example, in production it might point at a
// Render URL and in local development at localhost. See step 0 of the
// instructions for details.
const API = process.env.NEXT_PUBLIC_API_URL!;

// For each HTTP method we delegate to the common forward function. Next.js
// automatically calls the appropriate function based on the request method.
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params);
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params);
}

/**
 * Forward the incoming request to the backend. We construct a new URL by
 * concatenating the API base with the requested path segments and query
 * parameters. We also extract the JWT token from the cookie (if present)
 * and forward only selected headers (content-type and idempotency-key).
 */
async function forward(req: NextRequest, { path }: { path: string[] }) {
  const url = new URL(req.url);
  const target = `${API}/${path.join("/")}${url.search || ""}`;

  // Read token from httpOnly cookie set during login. If present we add
  // an Authorization header for the backend to authorize the call.
  const token = req.cookies.get("token")?.value;

  // Collect headers to forward. We copy through content-type so the backend
  // knows how to parse the body, and the custom Idempotency-Key header used
  // for idempotent POST/PUT/PATCH operations.
  const headers: Record<string, string> = {};
  for (const [k, v] of req.headers.entries()) {
    if (["content-type", "idempotency-key"].includes(k.toLowerCase())) headers[k] = v;
  }
  if (token) headers["authorization"] = `Bearer ${token}`;

  // For GET and HEAD requests we don't set a body. For other methods we
  // forward the request body unchanged by reading it as an ArrayBuffer.
  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
  };

  // Send the request to the backend and await its response. We read the
  // response body as an ArrayBuffer so that binary responses are supported.
  const resp = await fetch(target, init);
  const body = await resp.arrayBuffer();

  // Construct a new NextResponse with the same status and content-type
  // as the backend response. Other headers are omitted for simplicity.
  const next = new NextResponse(body, {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") || "application/json" },
  });
  return next;
}
