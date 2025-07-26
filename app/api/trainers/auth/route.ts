import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Trainer from '../../../../models/Trainer';
import jwt from 'jsonwebtoken';

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

    // Create JWT token
    const token = jwt.sign(
      { 
        id: trainer._id, 
        email: trainer.email, 
        name: trainer.name,
        role: 'trainer' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const trainerResponse = trainer.toObject();
    delete trainerResponse.password;

    return NextResponse.json({
      trainer: trainerResponse,
      token
    });
  } catch (error) {
    console.error('Trainer login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 