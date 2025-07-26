import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  type: 'member_added' | 'member_updated' | 'member_deleted';
  message: string;
  trainerId: mongoose.Types.ObjectId;
  trainerName: string;
  memberId?: mongoose.Types.ObjectId;
  memberName?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { 
      type: String, 
      required: true, 
      enum: ['member_added', 'member_updated', 'member_deleted'] 
    },
    message: { type: String, required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    trainerName: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    memberName: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema); 