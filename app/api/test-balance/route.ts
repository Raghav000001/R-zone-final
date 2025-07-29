import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Member from '../../../models/Member';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const data = await req.json();
    console.log('Test API - Received data:', data);
    
    // Create a test member with amountBalance
    const testMember = new Member({
      name: "Test Member",
      email: "test@example.com",
      phone: "1234567890",
      membershipType: "Monthly",
      startDate: new Date(),
      endDate: new Date(),
      amountPaid: 1000,
      amountBalance: 500, // Explicitly set amountBalance
    });
    
    console.log('Test API - Member before save:', testMember);
    await testMember.save();
    console.log('Test API - Member after save:', testMember);
    
    // Fetch the member back to verify
    const savedMember = await Member.findById(testMember._id);
    console.log('Test API - Fetched member:', savedMember);
    
    // Clean up - delete the test member
    await Member.findByIdAndDelete(testMember._id);
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully',
      testMember: {
        name: testMember.name,
        amountPaid: testMember.amountPaid,
        amountBalance: testMember.amountBalance
      },
      savedMember: savedMember ? {
        name: savedMember.name,
        amountPaid: savedMember.amountPaid,
        amountBalance: savedMember.amountBalance
      } : null
    });
    
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 