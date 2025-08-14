import { NextRequest, NextResponse } from "next/server";

/**
 * Handle user login on the server side. We forward the credentials to
 * the backend /auth/login endpoint and, on success, set a httpOnly cookie
 * containing the returned JWT access token. The cookie lifetime matches
 * JWT_EXPIRES (one day).
 */
export async function POST(req: NextRequest) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const body = await req.json(); // Expect { email, password }

  const resp = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await resp.json();

  if (!resp.ok) {
    // Forward error details and status if login failed.
    return NextResponse.json(data, { status: resp.status });
  }

  const token = data.access_token as string;
  const res = NextResponse.json({ ok: true });

  // Set token as httpOnly cookie on root path with 1 day expiry. We use
  // secure and sameSite=lax for security best practices.
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return res;
}