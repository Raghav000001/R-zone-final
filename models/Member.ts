import mongoose, { Document, Schema } from "mongoose";

export interface IMember extends Document {
  name: string;
  email: string;
  phone?: string;
  membershipType: string;
  startDate: Date;
  endDate?: Date;
  photo?: string; // Single photo field for compatibility
  photoFront?: string; // URL to Cloudinary or similar
  photoBack?: string;  // URL to Cloudinary or similar
  galleryPhotos?: string[];
  amountPaid?: number;
  amountBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    membershipType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    photo: { type: String }, // Single photo field
    photoFront: { type: String },
    photoBack: { type: String },
    galleryPhotos: [{ type: String }],
    amountPaid: { type: Number, default: 0 },
    amountBalance: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);
