import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  phone: string
  age?: number
  gender?: "male" | "female" | "other"
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  photo?: string
  plan: "basic" | "premium" | "elite"
  subscription: "monthly" | "quarterly" | "yearly"
  trainer?: mongoose.Types.ObjectId
  status: "active" | "inactive"
  medicalConditions?: string
  fitnessGoals?: string
  joinDate: Date
  lastClass?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: { type: String },
    emergencyContact: { type: String },
    emergencyPhone: { type: String },
    photo: { type: String },
    plan: { type: String, enum: ["basic", "premium", "elite"], required: true },
    subscription: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "Admin" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    medicalConditions: { type: String },
    fitnessGoals: { type: String },
    joinDate: { type: Date, default: Date.now },
    lastClass: { type: Date },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
