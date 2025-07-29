import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Member from '../../../../models/Member';
import Notification from '../../../../models/Notification';
import { authenticateRequest } from '@/lib/auth';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

// Helper function to verify trainer token
async function verifyTrainerToken(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user || user.role !== 'trainer') {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Trainer token verification error:', error);
    return null;
  }
}

// Helper function to create notification
export async function createNotification(type: string, trainerId: string, trainerName: string, memberId?: string, memberName?: string) {
  await dbConnect();
  try {
    console.log('[createNotification] type:', type);
    console.log('[createNotification] trainerId:', trainerId, '| memberId:', memberId);
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      throw new Error(`[createNotification] Invalid trainerId: ${trainerId}`);
    }
    if (memberId && !mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error(`[createNotification] Invalid memberId: ${memberId}`);
    }
    const messages = {
      member_added: `${trainerName} added a new member: ${memberName}`,
      member_updated: `${trainerName} updated member: ${memberName}`,
      member_deleted: `${trainerName} deleted member: ${memberName}`
    };
    const notification = new Notification({
      type,
      message: messages[type as keyof typeof messages],
      trainerId: new mongoose.Types.ObjectId(trainerId),
      trainerName,
      memberId: memberId ? new mongoose.Types.ObjectId(memberId) : undefined,
      memberName
    });
    console.log('[createNotification] Prepared notification:', notification);
    await notification.save();
    console.log('[createNotification] Notification saved successfully');
    // Enforce notification limit
    const notifCount = await Notification.countDocuments();
    if (notifCount > 100) {
      const oldest = await Notification.find().sort({ createdAt: 1 }).limit(notifCount - 100);
      const idsToDelete = oldest.map(n => n._id);
      await Notification.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`[createNotification] Deleted ${idsToDelete.length} oldest notifications to enforce limit`);
    }
  } catch (error) {
    console.error('[createNotification] Error:', error);
    throw error;
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
  return NextResponse.json(members);
}

// POST: Create a new member (trainer access with notification)
export async function POST(req: NextRequest) {
  // Enforce member limit
  const memberCount = await Member.countDocuments();
  if (memberCount >= 450) {
    return NextResponse.json({ error: 'Maximum member limit (450) reached.' }, { status: 400 });
  }
  
  console.log('[POST] /api/trainers/members called');
  const trainer = await verifyTrainerToken(req);
  if (!trainer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const data = await req.json();
  console.log('[POST] /api/trainers/members - Received data:', data);
  console.log('[POST] /api/trainers/members - photoFront:', data.photoFront ? 'exists' : 'not set');
  console.log('[POST] /api/trainers/members - photoBack:', data.photoBack ? 'exists' : 'not set');
  console.log('[POST] /api/trainers/members - amountBalance:', data.amountBalance);
  
  try {
    // Coerce dates if present
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    // Ensure amountBalance is always set
    if (data.amountBalance === undefined || data.amountBalance === null) {
      data.amountBalance = 0;
    }
    
    console.log('[POST] /api/trainers/members - Final data before save:', data);
    
    const member = new Member(data);
    console.log('[POST] /api/trainers/members - Member before save:', member);
    console.log('[POST] /api/trainers/members - Member amountBalance before save:', member.amountBalance);
    await member.save();
    console.log('[POST] /api/trainers/members - Member after save:', member);
    console.log('[POST] /api/trainers/members - Member amountBalance after save:', member.amountBalance);
    
    // Create notification for admin
    await createNotification(
      'member_added',
      trainer.userId,
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
  console.log('[PUT] /api/trainers/members called');
  const trainer = await verifyTrainerToken(req);
  if (!trainer) {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  console.log('Trainer verified:', trainer);
  await dbConnect();
  console.log('Database connected');
  
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    console.log('No member ID provided');
    return NextResponse.json({ error: 'Member id required' }, { status: 400 });
  }
  
  console.log('Member ID retrieved:', id);
  const data = await req.json();
  console.log('Received data for update:', data);
  console.log('[PUT] /api/trainers/members - amountBalance:', data.amountBalance);
  
  try {
    // Coerce dates if present
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    // Ensure amountBalance is always set
    if (data.amountBalance === undefined || data.amountBalance === null) {
      data.amountBalance = 0;
    }
    
    console.log('[PUT] /api/trainers/members - Final data before update:', data);
    const member = await Member.findByIdAndUpdate(id, data, { new: true });
    console.log('[PUT] /api/trainers/members - Updated member:', member);
    
    if (!member) {
      console.log('Member not found');
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    console.log('Creating notification for member update');
    // Create notification for admin
    await createNotification(
      'member_updated',
      trainer.userId,
      trainer.name,
      member._id.toString(),
      member.name
    );
    console.log('Notification created successfully');
    
    return NextResponse.json(member);
  } catch (err: any) {
    console.error("Trainer Member API PUT Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Remove a member (trainer access with notification)
export async function DELETE(req: NextRequest) {
  console.log('[DELETE] /api/trainers/members called');
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
      trainer.userId,
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
  console.log('Testing notification creation');
  try {
    await createNotification(
      'member_updated',
      'test_trainer_id',
      'Test Trainer',
      'test_member_id',
      'Test Member'
    );
    console.log('Test notification created successfully');
  } catch (error) {
    console.error('Error in test notification creation:', error);
  }
} 