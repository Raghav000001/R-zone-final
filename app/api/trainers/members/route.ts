import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Member from '../../../../models/Member';
import Notification from '../../../../models/Notification';
import jwt from 'jsonwebtoken';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

// Helper function to verify trainer token
async function verifyTrainerToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    if (decoded.role !== 'trainer') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to create notification
export async function createNotification(type: string, trainerId: string, trainerName: string, memberId?: string, memberName?: string) {
  console.log('Attempting to create notification'); // Debug log
  const messages = {
    member_added: `${trainerName} added a new member: ${memberName}`,
    member_updated: `${trainerName} updated member: ${memberName}`,
    member_deleted: `${trainerName} deleted member: ${memberName}`
  };

  const notification = new Notification({
    type,
    message: messages[type as keyof typeof messages],
    trainerId,
    trainerName,
    memberId,
    memberName
  });
  
  try {
    await notification.save();
    console.log('Notification saved successfully'); // Debug log
  } catch (error) {
    console.error('Error saving notification:', error); // Debug log
  }
}

// GET: List all members (trainer access)
export async function GET(req: NextRequest) {
  const trainer = await verifyTrainerToken(req);
  if (!trainer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const members = await Member.find({});
  return NextResponse.json(members); // Return array directly, not wrapped in object
}

// POST: Create a new member (trainer access with notification)
export async function POST(req: NextRequest) {
  const trainer = await verifyTrainerToken(req);
  if (!trainer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const data = await req.json();
  
  try {
    // Coerce dates if present
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    const member = new Member(data);
    await member.save();
    
    // Create notification for admin
    await createNotification(
      'member_added',
      trainer.id,
      trainer.name,
      member._id.toString(),
      member.name
    );
    
    return NextResponse.json(member, { status: 201 });
  } catch (err: any) {
    console.error("Trainer Member API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT: Update a member (trainer access with notification)
export async function PUT(req: NextRequest) {
  const trainer = await verifyTrainerToken(req);
  if (!trainer) {
    console.log('Unauthorized access attempt'); // Debug log
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('Trainer verified:', trainer); // Debug log
  
  await dbConnect();
  console.log('Database connected'); // Debug log
  
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    console.log('No member ID provided'); // Debug log
    return NextResponse.json({ error: 'Member id required' }, { status: 400 });
  }
  console.log('Member ID retrieved:', id); // Debug log
  
  const data = await req.json();
  console.log('Received data for update:', data); // Debug log
  
  try {
    // Coerce dates if present
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    const member = await Member.findByIdAndUpdate(id, data, { new: true });
    if (!member) {
      console.log('Member not found'); // Debug log
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    console.log('Creating notification for member update'); // Debug log
    // Create notification for admin
    await createNotification(
      'member_updated',
      trainer.id,
      trainer.name,
      member._id.toString(),
      member.name
    );
    console.log('Notification created successfully'); // Debug log
    
    return NextResponse.json(member);
  } catch (err: any) {
    console.error("Trainer Member API PUT Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Remove a member (trainer access with notification)
export async function DELETE(req: NextRequest) {
  const trainer = await verifyTrainerToken(req);
  if (!trainer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Member id required' }, { status: 400 });
  
  try {
    const member = await Member.findById(id);
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    
    const memberName = member.name;
    await Member.findByIdAndDelete(id);
    
    // Create notification for admin
    await createNotification(
      'member_deleted',
      trainer.id,
      trainer.name,
      id,
      memberName
    );
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Trainer Member API DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
} 

// Temporary test route to test notification creation
export async function TEST_NOTIFICATION() {
  console.log('Testing notification creation'); // Debug log
  try {
    await createNotification(
      'member_updated',
      'test_trainer_id',
      'Test Trainer',
      'test_member_id',
      'Test Member'
    );
    console.log('Test notification created successfully'); // Debug log
  } catch (error) {
    console.error('Error in test notification creation:', error); // Debug log
  }
} 