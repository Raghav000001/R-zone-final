import mongoose, { type Document, Schema } from "mongoose"

export interface IRevenue extends Document {
  user: mongoose.Types.ObjectId
  trainer?: mongoose.Types.ObjectId
  amount: number
  plan: string
  subscription: string
  paymentMethod: string
  transactionId: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentDate: Date
  nextPaymentDate?: Date
  createdAt: Date
  updatedAt: Date
}

const RevenueSchema = new Schema<IRevenue>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "Admin" },
    amount: { type: Number, required: true },
    plan: { type: String, required: true },
    subscription: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    paymentDate: { type: Date, default: Date.now },
    nextPaymentDate: { type: Date },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Revenue || mongoose.model<IRevenue>("Revenue", RevenueSchema)
