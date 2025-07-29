import { type NextRequest, NextResponse } from "next/server"

// Generate AI wellness plan using DeepSeek API
export async function POST(request: NextRequest) {
  try {
    const planData = await request.json()
    const { name, age, gender, weight, height, fitnessGoal, lifestyle, medicalConditions, dietPreference } = planData

    if (!name || !age || !fitnessGoal) {
      return NextResponse.json({ error: "Missing required fields (name, age, fitnessGoal)" }, { status: 400 })
    }

    // Check if DeepSeek API key exists
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DeepSeek API key not configured" }, { status: 500 })
    }

    // Generate AI-powered wellness plan using DeepSeek
    const wellnessPlan = await generateWellnessPlanWithDeepSeek(planData)

    return NextResponse.json({
      success: true,
      message: "Indian Fitness plan generated successfully",
      plan: wellnessPlan.plan,
      rawContent: wellnessPlan.rawContent,
      parseError: wellnessPlan.parseError
    })
  } catch (error) {
    console.error("Generate wellness plan error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate Indian fitness plan" 
    }, { status: 500 })
  }
}

// Helper function to generate wellness plan using DeepSeek API
async function generateWellnessPlanWithDeepSeek(userData: any) {
  const { name, age, gender, weight, height, fitnessGoal, lifestyle, medicalConditions, dietPreference } = userData

  // Create a detailed prompt for DeepSeek
  const prompt = `You are an expert Indian fitness trainer and nutritionist. Create a comprehensive fitness plan for the following person:

Name: ${name}
Age: ${age}
Gender: ${gender}
Weight: ${weight ? weight + ' kg' : 'not specified'}
Height: ${height ? height + ' cm' : 'not specified'}
Fitness Goal: ${fitnessGoal}
Lifestyle: ${lifestyle}
Diet Preference: ${dietPreference || 'flexible'}
Medical Conditions: ${medicalConditions || 'none specified'}

Please create a detailed Indian fitness plan that includes:

1. **Push Day Workout** - Focus on chest, shoulders, triceps with Indian gym equipment
2. **Pull Day Workout** - Focus on back, biceps with compound movements
3. **Legs Day Workout** - Comprehensive leg training including squats, deadlifts
4. **Cardio & HIIT Training** - Weekly frequency and specific routines
5. **FST-7 Training** - Target muscle and specific routine
6. **Indian Diet Plan** - Breakfast, lunch, dinner, and snacks with traditional Indian foods
7. **Supplements** - Recommendations based on goals
8. **Additional Recommendations** - Lifestyle and recovery tips

Format your response as a valid JSON object with this exact structure:

{
  "push_day": {
    "exercises": [
      {"name": "Exercise name", "sets": "Sets x Reps", "rest": "Rest time"}
    ]
  },
  "pull_day": {
    "exercises": [
      {"name": "Exercise name", "sets": "Sets x Reps", "rest": "Rest time"}
    ]
  },
  "legs_day": {
    "exercises": [
      {"name": "Exercise name", "sets": "Sets x Reps", "rest": "Rest time"}
    ]
  },
  "cardio_HIIT": {
    "weekly_frequency": "X times per week",
    "routine": ["Exercise 1", "Exercise 2", "Exercise 3"]
  },
  "fst7_day": {
    "target_muscle": "Target muscle group",
    "routine": ["Exercise 1", "Exercise 2", "Exercise 3"]
  },
  "diet_plan": {
    "type": "${dietPreference || 'Flexible'}",
    "breakfast": ["Item 1", "Item 2", "Item 3"],
    "lunch": ["Item 1", "Item 2", "Item 3"],
    "dinner": ["Item 1", "Item 2", "Item 3"],
    "snacks": ["Item 1", "Item 2", "Item 3"]
  },
  "supplements": ["Supplement 1", "Supplement 2", "Supplement 3"],
  "additional_recommendations": ["Tip 1", "Tip 2", "Tip 3"]
}

Make sure to:
- Include traditional Indian foods in the diet plan
- Consider the person's fitness goal when designing workouts
- Provide realistic and achievable recommendations
- Include proper rest periods and exercise progressions
- Consider any medical conditions mentioned
- Return ONLY the JSON object, no additional text or formatting`

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian fitness trainer and nutritionist. Always respond with valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from DeepSeek API')
    }

    // Try to parse the JSON response
    let parsedPlan
    let parseError = null
    let rawContent = aiResponse

    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanedResponse = aiResponse.trim()
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Find the JSON object
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd)
      }

      parsedPlan = JSON.parse(cleanedResponse)
      
      // Validate the structure
      if (!parsedPlan.push_day || !parsedPlan.pull_day || !parsedPlan.legs_day || !parsedPlan.diet_plan) {
        throw new Error('Invalid plan structure')
      }

    } catch (error) {
      parseError = error instanceof Error ? error.message : 'JSON parsing failed'
      
      // Create a fallback plan
      parsedPlan = createFallbackPlan(userData)
    }

    return {
      plan: parsedPlan,
      rawContent: rawContent,
      parseError: parseError
    }

  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw new Error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Fallback plan generator
function createFallbackPlan(userData: any) {
  const { fitnessGoal, dietPreference } = userData

  return {
    push_day: {
      exercises: [
        { name: "Bench Press", sets: "4 x 8-10", rest: "2-3 minutes" },
        { name: "Shoulder Press", sets: "3 x 10-12", rest: "90 seconds" },
        { name: "Incline Dumbbell Press", sets: "3 x 10-12", rest: "90 seconds" },
        { name: "Tricep Dips", sets: "3 x 12-15", rest: "60 seconds" },
        { name: "Lateral Raises", sets: "3 x 12-15", rest: "60 seconds" }
      ]
    },
    pull_day: {
      exercises: [
        { name: "Pull-ups/Chin-ups", sets: "4 x 6-10", rest: "2-3 minutes" },
        { name: "Bent Over Rows", sets: "4 x 8-10", rest: "2 minutes" },
        { name: "Lat Pulldowns", sets: "3 x 10-12", rest: "90 seconds" },
        { name: "Bicep Curls", sets: "3 x 12-15", rest: "60 seconds" },
        { name: "Face Pulls", sets: "3 x 15-20", rest: "60 seconds" }
      ]
    },
    legs_day: {
      exercises: [
        { name: "Squats", sets: "4 x 8-10", rest: "3 minutes" },
        { name: "Romanian Deadlifts", sets: "4 x 8-10", rest: "3 minutes" },
        { name: "Leg Press", sets: "3 x 12-15", rest: "2 minutes" },
        { name: "Calf Raises", sets: "4 x 15-20", rest: "60 seconds" },
        { name: "Leg Curls", sets: "3 x 12-15", rest: "90 seconds" }
      ]
    },
    cardio_HIIT: {
      weekly_frequency: "3-4 times per week",
      routine: [
        "20 minutes moderate cardio (treadmill/cycling)",
        "HIIT: 30 seconds high intensity, 90 seconds rest x 8 rounds",
        "10 minutes cool-down walk"
      ]
    },
    fst7_day: {
      target_muscle: "Arms",
      routine: [
        "Bicep curls - 7 sets x 12 reps (30 seconds rest)",
        "Tricep extensions - 7 sets x 12 reps (30 seconds rest)",
        "Hammer curls - 7 sets x 12 reps (30 seconds rest)"
      ]
    },
    diet_plan: {
      type: dietPreference || 'Flexible',
      breakfast: [
        "Oats with milk and banana",
        "2 boiled eggs or paneer scramble",
        "Green tea",
        "Mixed nuts and seeds"
      ],
      lunch: [
        "Brown rice with dal",
        "Mixed vegetable curry",
        "Chapati (2 pieces)",
        "Curd/Yogurt",
        "Salad"
      ],
      dinner: [
        "Quinoa or millet roti",
        "Grilled chicken/paneer",
        "Steamed vegetables",
        "Light soup"
      ],
      snacks: [
        "Fresh fruits (apple, banana)",
        "Protein smoothie",
        "Roasted chana",
        "Coconut water"
      ]
    },
    supplements: [
      "Whey Protein Powder",
      "Multivitamin",
      "Omega-3 Fish Oil",
      "Creatine Monohydrate (if building muscle)"
    ],
    additional_recommendations: [
      "Drink 3-4 liters of water daily",
      "Get 7-8 hours of quality sleep",
      "Take rest days between intense workouts",
      "Focus on progressive overload",
      "Track your workouts and measurements",
      "Warm up before workouts and cool down after"
    ]
  }
}