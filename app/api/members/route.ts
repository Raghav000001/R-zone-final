import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Member from '../../../models/Member';
import { authenticateRequest } from '@/lib/auth';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

// GET: List all members
export async function GET(req: NextRequest) {
  await dbConnect();
  const members = await Member.find({}).lean(); // Use lean() for better performance
  console.log('GET /api/members - Members found:', members.length);
  console.log('GET /api/members - Sample member amountBalance:', members[0]?.amountBalance);
  console.log('GET /api/members - Sample member full data:', JSON.stringify(members[0], null, 2));
  
  // Debug: Check all members for amountBalance
  members.forEach((member, index) => {
    console.log(`Member ${index + 1} (${member.name}): amountBalance = ${member.amountBalance}`);
  });
  
  return NextResponse.json(members); // Return array directly, not wrapped in object
}

// POST: Create a new member (admin only)
export async function POST(req: NextRequest) {
  // Enforce member limit
  const memberCount = await Member.countDocuments();
  if (memberCount >= 450) {
    return NextResponse.json({ error: 'Maximum member limit (450) reached.' }, { status: 400 });
  }
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const data = await req.json();
      console.log('POST /api/members - Received data:', data);
    console.log('POST /api/members - amountBalance:', data.amountBalance);
    console.log('POST /api/members - amountBalance type:', typeof data.amountBalance);
    console.log('POST /api/members - amountBalance === undefined:', data.amountBalance === undefined);
    console.log('POST /api/members - amountBalance === null:', data.amountBalance === null);
  try {
    // Coerce dates if present
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    // Ensure amountBalance is always set
    if (data.amountBalance === undefined || data.amountBalance === null) {
      data.amountBalance = 0;
    }
    
    console.log('POST /api/members - Final data before save:', data);
    
    const member = new Member(data);
    console.log('POST /api/members - Member before save:', member);
    console.log('POST /api/members - Member amountBalance before save:', member.amountBalance);
    await member.save();
    console.log('POST /api/members - Member after save:', member);
    console.log('POST /api/members - Member amountBalance after save:', member.amountBalance);
    return NextResponse.json(member, { status: 201 });
  } catch (err: any) {
    console.error("Member API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PATCH: Update a member (admin only)
export async function PATCH(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const data = await req.json();
  const { id, ...update } = data;
  if (!id) return NextResponse.json({ error: 'Member id required' }, { status: 400 });
  try {
    // Coerce dates if present
    if (update.startDate) update.startDate = new Date(update.startDate);
    if (update.endDate) update.endDate = new Date(update.endDate);
    const member = await Member.findByIdAndUpdate(id, update, { new: true });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (err: any) {
    console.error("Member API PATCH Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT: Update a member (admin only)
export async function PUT(req: NextRequest) {
  try {
    console.log('PUT /api/members - Request received');
    console.log('PUT /api/members - Cookies:', req.cookies.getAll());
    
    const user = await authenticateRequest(req);
    console.log('PUT /api/members - User:', user); // Debug log
    
    if (!user || user.role !== 'super_admin') {
      console.log('PUT /api/members - Auth failed. User:', user); // Debug log
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: !user ? 'No user found' : `Invalid role: ${user.role}`,
        cookies: req.cookies.getAll().map(c => c.name)
      }, { status: 401 });
    }
    
    await dbConnect();
    
    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Member id required' }, { status: 400 });
    
    const data = await req.json();
    console.log('PUT /api/members - Received data:', data);
    console.log('PUT /api/members - amountBalance:', data.amountBalance);
    try {
      // Coerce dates if present
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      
      // Ensure amountBalance is always set
      if (data.amountBalance === undefined || data.amountBalance === null) {
        data.amountBalance = 0;
      }
      
      console.log('PUT /api/members - Final data before update:', data);
      
      const member = await Member.findByIdAndUpdate(id, data, { new: true });
      console.log('PUT /api/members - Updated member:', member);
      if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      return NextResponse.json(member);
    } catch (err: any) {
      console.error("Member API PUT Error:", err);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (error) {
    console.error("PUT /api/members - Unexpected error:", error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Remove a member (admin only)
export async function DELETE(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  let id = req.nextUrl.searchParams.get('id');
  if (!id) {
    try {
      const data = await req.json();
      id = data.id;
    } catch {}
  }
  if (!id) return NextResponse.json({ error: 'Member id required' }, { status: 400 });
  try {
    const result = await Member.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Member API DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

