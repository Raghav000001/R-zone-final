import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface ITrainer extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  photo?: string;
  contact?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
  rating?: number;
  students?: number;
  certifications?: string[];
  languages?: string[];
  availability?: string;
  specialties?: string[];
  achievements?: string[];
  testimonials?: Array<{
    name: string;
    text: string;
    rating: number;
  }>;
  classTypes?: Array<{
    name: string;
    duration: string;
    price: string;
    description: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    photo: { type: String },
    contact: { type: String },
    specialization: { type: String },
    experience: { type: Number },
    bio: { type: String },
    rating: { type: Number },
    students: { type: Number },
    certifications: [{ type: String }],
    languages: [{ type: String }],
    availability: { type: String },
    specialties: [{ type: String }],
    achievements: [{ type: String }],
    testimonials: [{
      name: { type: String },
      text: { type: String },
      rating: { type: Number }
    }],
    classTypes: [{
      name: { type: String },
      duration: { type: String },
      price: { type: String },
      description: { type: String }
    }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
TrainerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
TrainerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Trainer || mongoose.model<ITrainer>("Trainer", TrainerSchema); 