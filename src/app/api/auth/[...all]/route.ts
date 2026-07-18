import { NextResponse } from "next/server";

// Auth has been removed. This route returns 404 to prevent
// better-auth from being initialized during the build.
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
