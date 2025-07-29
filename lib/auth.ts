import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
console.log('JWT_SECRET configured with length:', JWT_SECRET.length);

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
    console.log('verifyToken - token preview:', token.substring(0, 20) + '...');
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
  // Check both admin and trainer cookies
  const adminToken = request.cookies.get("auth-token")?.value;
  const trainerToken = request.cookies.get("trainer-token")?.value;
  console.log('getTokenFromRequest - authHeader:', authHeader);
  console.log('getTokenFromRequest - admin token:', adminToken ? 'exists' : 'not found');
  console.log('getTokenFromRequest - trainer token:', trainerToken ? 'exists' : 'not found');
  console.log('getTokenFromRequest - trainer token length:', trainerToken?.length);
  console.log('getTokenFromRequest - trainer token preview:', trainerToken ? trainerToken.substring(0, 20) + '...' : 'none');
  
  // For trainer-specific endpoints, prioritize trainer token
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/trainers/') || pathname.startsWith('/trainer/')) {
    console.log('getTokenFromRequest - using trainer token for trainer endpoint');
    return trainerToken || null;
  }
  
  // For admin-specific endpoints, prioritize admin token
  if (pathname.startsWith('/api/admin/') || pathname.startsWith('/admin/')) {
    console.log('getTokenFromRequest - using admin token for admin endpoint');
    return adminToken || null;
  }
  
  // Default fallback
  return adminToken || trainerToken || null;
}

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  console.log('authenticateRequest - starting...');
  const token = getTokenFromRequest(request);
  console.log('authenticateRequest - token found:', !!token);
  console.log('authenticateRequest - token length:', token?.length);
  console.log('authenticateRequest - pathname:', request.nextUrl.pathname);
  
  if (!token) {
    console.log('authenticateRequest - no token found');
    return null;
  }
  
  const result = await verifyToken(token);
  console.log('authenticateRequest - verification result:', result);
  console.log('authenticateRequest - user role:', result?.role);
  return result;
}
