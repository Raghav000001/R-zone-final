import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IAdmin extends Document {
  name: string
  email: string
  password: string
  role: "super_admin" | "trainer"
  phone?: string
  specialization?: string[]
  experience?: string
  rating?: number
  students?: number
  bio?: string
  certifications?: string[]
  languages?: string[]
  availability?: string
  photo?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "trainer"], required: true },
    phone: { type: String },
    specialization: [{ type: String }],
    experience: { type: String },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    bio: { type: String },
    certifications: [{ type: String }],
    languages: [{ type: String }],
    availability: { type: String },
    photo: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)
