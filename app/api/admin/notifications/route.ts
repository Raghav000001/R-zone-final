import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notification from '../../../../models/Notification';
import { authenticateRequest } from '@/lib/auth';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

// GET: List all notifications (admin only)
export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(50);
  
  return NextResponse.json({ notifications });
}

// PATCH: Mark notification as read (admin only)
export async function PATCH(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const { id } = await req.json();
  
  if (!id) return NextResponse.json({ error: 'Notification id required' }, { status: 400 });
  
  try {
    const notification = await Notification.findByIdAndUpdate(
      id, 
      { isRead: true }, 
      { new: true }
    );
    
    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    return NextResponse.json(notification);
  } catch (err: any) {
    console.error("Notification API PATCH Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Delete notification (admin only)
export async function DELETE(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'Notification id required' }, { status: 400 });
  
  try {
    const result = await Notification.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Notification API DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
} 