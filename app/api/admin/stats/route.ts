import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Member from "@/models/Member"
import Trainer from "@/models/Trainer"
import WellnessPlan from "@/models/WellnessPlan"
import Revenue from "@/models/Revenue"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/stats - Request received');
    console.log('GET /api/admin/stats - Cookies:', request.cookies.getAll());
    
    const user = await authenticateRequest(request);
    console.log('GET /api/admin/stats - User:', user);
    
    if (!user || user.role !== "super_admin") {
      console.log('GET /api/admin/stats - Auth failed. User:', user);
      return NextResponse.json({ 
        error: "Access denied",
        details: !user ? 'No user found' : `Invalid role: ${user.role}`,
        cookies: request.cookies.getAll().map(c => c.name)
      }, { status: 403 })
    }

    await dbConnect()

    // Get all stats
    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      activeTrainers,
      totalPlans,
      totalRevenue,
      monthlyRevenue,
      quarterlyRevenue,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ 
        $or: [
          { endDate: { $gt: new Date() } },
          { endDate: { $exists: false } }
        ]
      }),
      Member.countDocuments({ 
        endDate: { $lt: new Date() }
      }),
      // Fixed: Use Trainer model instead of Admin model
      Trainer.countDocuments(),
      Trainer.countDocuments({ isActive: true }),
      WellnessPlan.countDocuments(),
      // Calculate total revenue from member amounts instead of Revenue model
      Member.aggregate([
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      // Calculate monthly revenue from member amounts
      Member.aggregate([
        {
          $match: {
            startDate: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),
      // Calculate quarterly revenue from member amounts
      Member.aggregate([
        {
          $match: {
            startDate: {
              $gte: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),
    ])

    const stats = {
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      activeTrainers,
      totalPlans,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      quarterlyRevenue: quarterlyRevenue[0]?.total || 0,
    };

    console.log('GET /api/admin/stats - Stats calculated:', stats);
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
