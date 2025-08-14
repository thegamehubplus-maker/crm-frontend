import { NextResponse } from "next/server";

/**
 * Handle user logout on the server side. We clear the httpOnly JWT cookie
 * by setting it with an empty value and maxAge=0, effectively removing
 * it from the browser. The response body simply acknowledges the action.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}