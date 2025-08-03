import mongoose, { Schema, model, models } from "mongoose";

const ExerciseSchema = new Schema({
  name: String,
  prescription: String,
  rest: String,
  notes: String
}, { _id: false });

const WorkoutDaySchema = new Schema({
  name: String,
  day: String,
  exercises: [ExerciseSchema]
}, { _id: false });

const CardioPlanSchema = new Schema({
  type: String,
  frequency: String,
  sessions: [String],
  reasoning: String
}, { _id: false });

const NutritionPlanSchema = new Schema({
  diet_type: String,
  meals: Schema.Types.Mixed, // Flexible object so keys can vary
  special_notes: [String]
}, { _id: false });

const WellnessPlanSchema = new Schema({
  user_id: { type: String, required: true },
  input: Schema.Types.Mixed,
  analysis_reasoning: String,
  workout_days: [WorkoutDaySchema],
  cardio_plan: CardioPlanSchema,
  nutrition_plan: NutritionPlanSchema,
  supplements: [String],
  lifestyle_recommendations: [String],
  progression: String,
  precautions: [String],
  createdAt: { type: Date, default: () => new Date() }
});

export default models.WellnessPlan || model("WellnessPlan", WellnessPlanSchema);
