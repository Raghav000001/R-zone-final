import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Trainer from '../../../../models/Trainer';
import { generateToken } from '@/lib/auth';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

// POST: Trainer login
export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const trainer = await Trainer.findOne({ email, isActive: true });
    if (!trainer) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await trainer.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token using the auth library
    const token = await generateToken({
      userId: trainer._id.toString(),
      email: trainer.email,
      role: 'trainer',
      name: trainer.name,
    });

    console.log('Trainer auth - generated token:', token.substring(0, 20) + '...');
    console.log('Trainer auth - trainer data:', {
      userId: trainer._id.toString(),
      email: trainer.email,
      role: 'trainer',
      name: trainer.name,
    });

    const trainerResponse = trainer.toObject();
    delete trainerResponse.password;

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      trainer: trainerResponse,
    });

    // Set HTTP-only cookie
    response.cookies.set("trainer-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    console.log('Trainer auth - cookie set successfully');

    return response;
  } catch (error) {
    console.error('Trainer login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 