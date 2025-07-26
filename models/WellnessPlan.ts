import mongoose, { type Document, Schema } from "mongoose"

export interface IWellnessPlan extends Document {
  user: mongoose.Types.ObjectId
  name: string
  age: number
  gender: string
  weight?: number
  height?: number
  fitnessGoals: string
  lifestyle: string
  medicalConditions?: string
  fitnessRoutine: {
    morning: string[]
    evening: string[]
  }
  dietChart: {
    breakfast: string[]
    lunch: string[]
    dinner: string[]
    snacks: string[]
  }
  recommendations: string[]
  status: "active" | "completed" | "paused"
  generatedDate: Date
  createdAt: Date
  updatedAt: Date
}

const WellnessPlanSchema = new Schema<IWellnessPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    weight: { type: Number },
    height: { type: Number },
    fitnessGoals: { type: String, required: true },
    lifestyle: { type: String, required: true },
    medicalConditions: { type: String },
    fitnessRoutine: {
      morning: [{ type: String }],
      evening: [{ type: String }],
    },
    dietChart: {
      breakfast: [{ type: String }],
      lunch: [{ type: String }],
      dinner: [{ type: String }],
      snacks: [{ type: String }],
    },
    recommendations: [{ type: String }],
    status: { type: String, enum: ["active", "completed", "paused"], default: "active" },
    generatedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.WellnessPlan || mongoose.model<IWellnessPlan>("WellnessPlan", WellnessPlanSchema)
