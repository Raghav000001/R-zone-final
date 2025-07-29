import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Member from '../../../../models/Member';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    console.log('=== FIXING AMOUNT BALANCE FOR ALL MEMBERS ===');
    
    // Get all members
    const allMembers = await Member.find({});
    console.log(`Total members found: ${allMembers.length}`);
    
    // Check which members need the amountBalance field
    const membersWithoutBalance = allMembers.filter((member: any) => 
      member.amountBalance === undefined || member.amountBalance === null
    );
    
    console.log(`Members without amountBalance field: ${membersWithoutBalance.length}`);
    
    if (membersWithoutBalance.length > 0) {
      // Update each member individually
      let updatedCount = 0;
      for (const member of membersWithoutBalance) {
        console.log(`Fixing member: ${member.name} (ID: ${member._id})`);
        member.amountBalance = 0;
        await member.save();
        updatedCount++;
      }
      
      console.log(`Successfully updated ${updatedCount} members`);
    } else {
      console.log('All members already have amountBalance field');
    }
    
    // Verify the fix
    const updatedMembers = await Member.find({});
    console.log('=== VERIFICATION ===');
    updatedMembers.forEach((member: any, index: number) => {
      console.log(`Member ${index + 1} (${member.name}): amountBalance = ${member.amountBalance}`);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${membersWithoutBalance.length} members with amountBalance field.`,
      totalMembers: updatedMembers.length,
      fixedCount: membersWithoutBalance.length
    });
    
  } catch (error) {
    console.error('Failed to fix members:', error);
    return NextResponse.json({ 
      error: 'Failed to fix members', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 