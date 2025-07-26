import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export interface JWTPayload {
  userId: string;
  email: string;
  role: "super_admin" | "trainer";
  name: string;
}

function isJWTPayload(payload: any): payload is JWTPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string' &&
    typeof payload.name === 'string'
  );
}
export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('verifyToken - starting with token length:', token.length);
    console.log('verifyToken - JWT_SECRET length:', JWT_SECRET.length);
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('verifyToken - payload received:', payload);
    
    if (isJWTPayload(payload)) {
      console.log('verifyToken - payload is valid JWTPayload');
      return payload;
    }
    console.log('verifyToken - payload is not valid JWTPayload:', payload);
    return null;
  } catch (error) {
    console.error('verifyToken - error:', error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  // Also check cookies
  const token = request.cookies.get("auth-token")?.value;
  console.log('getTokenFromRequest - authHeader:', authHeader);
  console.log('getTokenFromRequest - cookie token:', token ? 'exists' : 'not found');
  return token || null;
}

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  console.log('authenticateRequest - starting...');
  const token = getTokenFromRequest(request);
  console.log('authenticateRequest - token found:', !!token);
  if (!token) {
    console.log('authenticateRequest - no token found');
    return null;
  }
  const result = await verifyToken(token);
  console.log('authenticateRequest - verification result:', result);
  return result;
}
