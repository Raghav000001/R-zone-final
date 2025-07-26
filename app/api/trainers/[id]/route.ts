import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Trainer from '../../../../models/Trainer'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return
  await mongoose.connect(process.env.MONGODB_URI as string)
}

// GET: Fetch individual trainer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  try {
    const trainer = await Trainer.findById(params.id).select('-password')
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }
    return NextResponse.json(trainer)
  } catch (err: any) {
    console.error('GET /api/trainers/[id] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// PATCH: Update trainer (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await dbConnect()
  const data = await req.json()
  try {
    const trainer = await Trainer.findByIdAndUpdate(params.id, data, { new: true }).select('-password')
    if (!trainer) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    return NextResponse.json(trainer)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// DELETE: Remove trainer (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await dbConnect()
  try {
    const result = await Trainer.findByIdAndDelete(params.id)
    if (!result) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
