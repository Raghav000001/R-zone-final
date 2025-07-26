import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Trainer from '../../../models/Trainer';
import { authenticateRequest } from '@/lib/auth';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

// GET: List all trainers
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const trainers = await Trainer.find({ isActive: true }).select('-password');
    return NextResponse.json({ trainers });
  } catch (error) {
    console.error('GET /api/trainers Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 });
  }
}

// POST: Create a new trainer (admin only)
export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const data = await req.json();
  try {
    const trainer = new Trainer(data);
    await trainer.save();
    const trainerResponse = trainer.toObject();
    delete trainerResponse.password;
    return NextResponse.json(trainerResponse, { status: 201 });
  } catch (err: any) {
    console.error("Trainer API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT: Update a trainer (admin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    console.log('PUT /api/trainers - User:', user); // Debug log
    
    if (!user || user.role !== 'super_admin') {
      console.log('PUT /api/trainers - Auth failed. User:', user); // Debug log
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: !user ? 'No user found' : `Invalid role: ${user.role}`
      }, { status: 401 });
    }
    
    await dbConnect();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Trainer id required' }, { status: 400 });
    
    const data = await req.json();
    try {
      const trainer = await Trainer.findByIdAndUpdate(id, data, { new: true }).select('-password');
      if (!trainer) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
      return NextResponse.json(trainer);
    } catch (err: any) {
      console.error("Trainer API PUT Error:", err);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (error) {
    console.error("PUT /api/trainers - Unexpected error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a trainer (admin only)
export async function DELETE(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Trainer id required' }, { status: 400 });
  
  try {
    const result = await Trainer.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Trainer API DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
