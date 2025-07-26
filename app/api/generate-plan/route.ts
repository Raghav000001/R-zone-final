import { NextRequest, NextResponse } from 'next/server';
import { WellnessFormData, GeneratePlanResponse, GeneratePlanError } from '@/types/wellness';

// In-memory storage for request tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Function to get client identifier (IP or session-based)
function getClientId(request: NextRequest): string {
  // Try to get IP address, fallback to a session-based identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return ip;
}

// Function to check and update request limit
function checkRequestLimit(clientId: string): boolean {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const resetTime = Math.floor(now / dayInMs) * dayInMs; // Start of current day

  const clientData = requestCounts.get(clientId);
  
  if (!clientData || clientData.resetTime !== resetTime) {
    // New day or new client, reset count
    requestCounts.set(clientId, { count: 1, resetTime });
    return true;
  }

  if (clientData.count >= 10) {
    // Daily limit reached
    return false;
  }

  // Increment count
  clientData.count++;
  requestCounts.set(clientId, clientData);
  return true;
}

// Clean up old entries periodically (optional, for memory management)
setInterval(() => {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  const resetTime = Math.floor(now / dayInMs) * dayInMs;
  
  for (const [clientId, data] of requestCounts.entries()) {
    if (data.resetTime < resetTime) {
      requestCounts.delete(clientId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

export async function POST(request: NextRequest): Promise<NextResponse<GeneratePlanResponse | GeneratePlanError>> {
  try {
    const clientId = getClientId(request);
    
    // Check request limit
    if (!checkRequestLimit(clientId)) {
      return NextResponse.json(
        { error: '❌ Daily request limit (10) reached. Try again tomorrow.' },
        { status: 429 }
      );
    }

    const formData: WellnessFormData = await request.json();

    // Validate required fields
    if (!formData.name || !formData.age || !formData.fitnessGoal) {
      return NextResponse.json(
        { error: 'Missing required fields: name, age, and fitnessGoal are required' },
        { status: 400 }
      );
    }

    // Validate age
    if (formData.age < 1 || formData.age > 120) {
      return NextResponse.json(
        { error: 'Age must be between 1 and 120' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please add GROQ_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Create the prompt for Groq API
    const prompt = `You are a professional fitness and nutrition coach. Based on the user's profile, generate a full **Indian gym-based workout and diet plan**, personalized to the given details.

User details:
- Name: ${formData.name}
- Age: ${formData.age}
- Gender: ${formData.gender || 'not specified'}
- Height: ${formData.height || 'not specified'} cm
- Weight: ${formData.weight || 'not specified'} kg
- Fitness Goal: ${formData.fitnessGoal}
- Lifestyle: ${formData.lifestyle || 'not specified'}
- Medical Conditions: ${formData.medicalConditions || 'none'}
- Diet Preference: ${formData.dietPreference || 'flexible'}

Your response should be **structured in this exact JSON format**:

{
  "push_day": {
    "exercises": [
      { "name": "Barbell Bench Press", "sets": "4x8-10", "rest": "2-3 min" },
      { "name": "Incline Dumbbell Press", "sets": "4x10-12", "rest": "90 sec" },
      { "name": "Overhead Press", "sets": "4x8", "rest": "2 min" },
      { "name": "Triceps Pushdown", "sets": "3x12", "rest": "60 sec" }
    ]
  },
  "pull_day": {
    "exercises": [
      { "name": "Deadlift", "sets": "4x5", "rest": "3-4 min" },
      { "name": "Lat Pulldown", "sets": "4x10", "rest": "90 sec" },
      { "name": "Barbell Row", "sets": "4x8", "rest": "2 min" },
      { "name": "Bicep Curls", "sets": "3x12", "rest": "60 sec" }
    ]
  },
  "legs_day": {
    "exercises": [
      { "name": "Back Squat", "sets": "4x8", "rest": "3 min" },
      { "name": "Leg Press", "sets": "4x12", "rest": "2 min" },
      { "name": "Romanian Deadlift", "sets": "3x10", "rest": "2 min" },
      { "name": "Calf Raises", "sets": "3x20", "rest": "45 sec" }
    ]
  },
  "cardio_HIIT": {
    "routine": [
      "HIIT treadmill run - 20 mins (1 min sprint + 1 min walk)",
      "Jump rope - 5 rounds of 1 minute",
      "Burpees - 3 sets of 15"
    ],
    "weekly_frequency": "3x/week post workout"
  },
  "fst7_day": {
    "target_muscle": "Chest or Biceps (depending on goal)",
    "routine": [
      "Cable Fly (FST7) - 7 sets x 12 reps, 30 sec rest"
    ]
  },
  "diet_plan": {
    "type": "Indian ${formData.dietPreference || 'flexible'}",
    "breakfast": [
      "Oats with almond milk, banana, and chia seeds",
      "Tofu or Paneer bhurji (Veg) / 3 boiled eggs + toast (Non-Veg)"
    ],
    "lunch": [
      "Brown rice, dal, sabzi, cucumber salad",
      "Grilled paneer or chicken breast"
    ],
    "snacks": [
      "Peanuts or sprouts chaat",
      "Black coffee or green tea"
    ],
    "dinner": [
      "Roti + sabzi + dal + salad",
      "Optional: Quinoa or daliya + curd"
    ]
  },
  "supplements": [
    "Creatine Monohydrate (5g post workout)",
    "Plant-based protein or Whey (depending on preference)"
  ],
  "additional_recommendations": [
    "Hydration: At least 3L of water daily",
    "Sleep: 7-8 hours minimum",
    "Track progress weekly"
  ]
}

Guidelines for Indian fitness context:
- Include popular Indian gym exercises and equipment commonly available
- Consider Indian dietary preferences and food availability
- Include traditional Indian foods like dal, roti, paneer, curd, etc.
- Adjust protein sources based on diet preference (veg/non-veg)
- Consider Indian lifestyle factors and workout timing
- Include cost-effective supplement recommendations
- Provide realistic rest periods and progression plans
- Consider Indian weather conditions for cardio recommendations
- Include Indian fitness culture elements like morning walks, yoga integration

Please respond with only the JSON structure, no additional text.`;

    console.log('Sending request to Groq API...');

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      return NextResponse.json(
        { error: `Failed to generate Indian fitness plan: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      console.error('No content generated from AI');
      return NextResponse.json(
        { error: 'No content generated from AI' },
        { status: 500 }
      );
    }

    console.log('AI response received:', generatedContent);
    console.log('Attempting to parse JSON...');

    // Try to parse the JSON response from the AI
    try {
      // Clean the response - remove any markdown formatting
      let cleanedContent = generatedContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned content:', cleanedContent);
      
      const parsedPlan = JSON.parse(cleanedContent);
      
      // Validate the parsed plan structure
      if (!parsedPlan.push_day || !parsedPlan.pull_day || !parsedPlan.legs_day || !parsedPlan.diet_plan) {
        console.error('Invalid plan structure:', parsedPlan);
        throw new Error('Invalid plan structure');
      }

      console.log('Indian fitness plan generated successfully');
      return NextResponse.json({ plan: parsedPlan });
    } catch (parseError) {
      // If JSON parsing fails, return the raw content and log the error
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', generatedContent);
      
      // Try to extract JSON from the response if it's wrapped in text
      try {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          if (extractedJson.push_day && extractedJson.pull_day && extractedJson.legs_day && extractedJson.diet_plan) {
            console.log('Successfully extracted JSON from response');
            return NextResponse.json({ plan: extractedJson });
          }
        }
      } catch (extractError) {
        console.error('Failed to extract JSON from response:', extractError);
      }
      
      // Return fallback plan with raw content
      return NextResponse.json({ 
        plan: {
          push_day: {
            exercises: [
              { name: "AI response could not be parsed. Please try again.", sets: "N/A", rest: "N/A" }
            ]
          },
          pull_day: {
            exercises: [
              { name: "AI response could not be parsed. Please try again.", sets: "N/A", rest: "N/A" }
            ]
          },
          legs_day: {
            exercises: [
              { name: "AI response could not be parsed. Please try again.", sets: "N/A", rest: "N/A" }
            ]
          },
          cardio_HIIT: {
            routine: ["AI response could not be parsed. Please try again."],
            weekly_frequency: "N/A"
          },
          fst7_day: {
            target_muscle: "N/A",
            routine: ["AI response could not be parsed. Please try again."]
          },
          diet_plan: {
            type: "N/A",
            breakfast: ["AI response could not be parsed. Please try again."],
            lunch: ["AI response could not be parsed. Please try again."],
            snacks: ["AI response could not be parsed. Please try again."],
            dinner: ["AI response could not be parsed. Please try again."]
          },
          supplements: ["AI response could not be parsed. Please try again."],
          additional_recommendations: ["AI response could not be parsed. Please try again."]
        },
        rawContent: generatedContent,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      });
    }

  } catch (error) {
    console.error('Generate plan error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 