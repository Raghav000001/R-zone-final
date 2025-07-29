export interface WellnessFormData {
  name: string;
  age: number;
  gender: string;
  height?: number;
  weight?: number;
  fitnessGoal: string;
  lifestyle?: string;
  medicalConditions?: string;
  dietPreference?: string;
}

export interface Exercise {
  name: string;
  sets: string;
  rest: string;
}

export interface WorkoutDay {
  exercises: Exercise[];
}

export interface CardioHIIT {
  routine: string[];
  weekly_frequency: string;
}

export interface FST7Day {
  target_muscle: string;
  routine: string[];
}

export interface DietPlan {
  type: string;
  morning_routine?: string[];
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
  bedtime_routine?: string[];
}

export interface WellnessPlan {
  push_day: WorkoutDay;
  pull_day: WorkoutDay;
  legs_day: WorkoutDay;
  cardio_HIIT: CardioHIIT;
  fst7_day: FST7Day;
  diet_plan: DietPlan;
  supplements: string[];
  additional_recommendations: string[];
}

export interface GeneratePlanResponse {
  plan: WellnessPlan;
  rawContent?: string;
}

export interface GeneratePlanError {
  error: string;
} 