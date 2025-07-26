import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import WellnessPlan from "@/models/WellnessPlan"

// Generate AI wellness plan
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const planData = await request.json()
    const { name, age, gender, weight, height, fitnessGoals, lifestyle, medicalConditions } = planData

    if (!name || !age || !gender || !fitnessGoals || !lifestyle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate AI-powered wellness plan based on user data
    const wellnessPlan = generateWellnessPlan(planData)

    // Save to database
    const newPlan = new WellnessPlan({
      name,
      age,
      gender,
      weight,
      height,
      fitnessGoals,
      lifestyle,
      medicalConditions,
      ...wellnessPlan,
    })

    await newPlan.save()

    return NextResponse.json({
      success: true,
      message: "Wellness plan generated successfully",
      plan: newPlan,
    })
  } catch (error) {
    console.error("Generate wellness plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to generate wellness plan based on user data
function generateWellnessPlan(userData: any) {
  const { age, gender, fitnessGoals, lifestyle, medicalConditions } = userData

  // Base yoga routines
  const morningRoutine = [
    "Surya Namaskara (Sun Salutation) - 5 rounds",
    "Vrikshasana (Tree Pose) - 1 minute each side",
    "Bhujangasana (Cobra Pose) - 30 seconds, 3 reps",
    "Balasana (Child's Pose) - 2 minutes",
    "Pranayama (Breathing Exercise) - 5 minutes",
  ]

  const eveningRoutine = [
    "Paschimottanasana (Seated Forward Bend) - 2 minutes",
    "Supta Baddha Konasana (Reclining Butterfly) - 3 minutes",
    "Viparita Karani (Legs Up Wall) - 5 minutes",
    "Shavasana (Corpse Pose) - 10 minutes",
    "Meditation - 10 minutes",
  ]

  // Customize based on fitness goals
  if (fitnessGoals === "weight-loss") {
    morningRoutine.unshift("Kapalbhati Pranayama - 5 minutes")
    morningRoutine.push("Navasana (Boat Pose) - 3 sets of 30 seconds")
  } else if (fitnessGoals === "strength") {
    morningRoutine.push("Chaturanga Dandasana - 3 sets of 10")
    morningRoutine.push("Warrior III - 30 seconds each side")
  } else if (fitnessGoals === "flexibility") {
    eveningRoutine.unshift("Gomukhasana (Cow Face Pose) - 2 minutes each side")
    eveningRoutine.unshift("Marichyasana - 1 minute each side")
  }

  // Base diet chart
  const dietChart = {
    breakfast: ["Warm water with lemon and honey", "Oats porridge with almonds and berries", "Green tea or herbal tea"],
    lunch: [
      "Brown rice with dal (lentils)",
      "Mixed vegetable curry",
      "Fresh salad with cucumber and tomatoes",
      "Buttermilk or lassi",
    ],
    dinner: [
      "Quinoa or millet roti",
      "Steamed vegetables",
      "Light soup (vegetable or lentil)",
      "Herbal tea before bed",
    ],
    snacks: [
      "Fresh fruits (apple, banana, or seasonal)",
      "Handful of nuts and seeds",
      "Coconut water",
      "Homemade energy balls",
    ],
  }

  // Customize diet based on goals
  if (fitnessGoals === "weight-loss") {
    dietChart.breakfast.push("Add chia seeds to oats")
    dietChart.snacks = ["Green tea", "Cucumber slices", "Handful of almonds"]
  } else if (fitnessGoals === "strength") {
    dietChart.breakfast.push("Protein smoothie with banana")
    dietChart.lunch.push("Paneer or tofu curry")
  }

  const recommendations = [
    "Practice yoga consistently at the same time daily",
    "Stay hydrated - drink 8-10 glasses of water",
    "Get 7-8 hours of quality sleep",
    "Avoid processed foods and excessive sugar",
    "Practice mindful eating and chew slowly",
    "Take short walks after meals",
    "Practice deep breathing when stressed",
  ]

  // Add age-specific recommendations
  if (age > 50) {
    recommendations.push("Focus on gentle movements and joint mobility")
    recommendations.push("Include calcium-rich foods in your diet")
  } else if (age < 30) {
    recommendations.push("Challenge yourself with advanced poses gradually")
    recommendations.push("Maintain consistent workout schedule")
  }

  return {
    yogaRoutine: {
      morning: morningRoutine,
      evening: eveningRoutine,
    },
    dietChart,
    recommendations,
  }
}
