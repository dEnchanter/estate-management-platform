import { NextRequest, NextResponse } from "next/server";

// Server-side only — never exposed to the browser bundle
const BACKEND_URL = process.env.BACKEND_API_URL || "http://16.171.32.5:8080/api";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = new URL(`${BACKEND_URL}/${path.join("/")}`);

  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  // Forward only the headers the backend needs
  const forwardedHeaders: Record<string, string> = {
    "content-type": request.headers.get("content-type") || "application/json",
  };
  const authorization = request.headers.get("authorization");
  if (authorization) {
    forwardedHeaders["authorization"] = authorization;
  }

  // Read body for non-GET/HEAD requests
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardedHeaders,
      body,
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the backend server." },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
