import mongoose, { type Document, Schema } from "mongoose"

export interface ISession extends Document {
  user: mongoose.Types.ObjectId
  trainer: mongoose.Types.ObjectId
  sessionType: "group" | "private" | "online"
  className: string
  date: Date
  duration: number
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    sessionType: { type: String, enum: ["group", "private", "online"], required: true },
    className: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    status: { type: String, enum: ["scheduled", "completed", "cancelled", "no_show"], default: "scheduled" },
    notes: { type: String },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)
