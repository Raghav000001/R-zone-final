// app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from "next/server";

const MAX_DAILY_REQUESTS = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getClientId(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0] : req.ip || 'unknown') as string;
}

function checkRequestLimit(clientId: string) {
  const now = Date.now();
  const dayInMs = 24*60*60*1000;
  const resetTime = Math.floor(now/dayInMs)*dayInMs;
  const clientData = requestCounts.get(clientId);

  if (!clientData || clientData.resetTime !== resetTime) {
    requestCounts.set(clientId,{count:1,resetTime});
    return true;
  }
  if (clientData.count>=MAX_DAILY_REQUESTS) return false;
  clientData.count++;
  requestCounts.set(clientId, clientData);
  return true;
}

// Periodic cleanup
setInterval(()=>{
  const now=Date.now();
  const dayInMs = 24*60*60*1000;
  const resetTime=Math.floor(now/dayInMs)*dayInMs;
  for(const [clientId,data] of requestCounts.entries()){
    if(data.resetTime<resetTime) requestCounts.delete(clientId);
  }
}, 60*60*1000);

// Enhanced JSON extraction function
function extractJSON(content: string): any {
  // Remove <think> tags and their content
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // Remove any remaining think tags (unclosed)
  content = content.replace(/<think>[\s\S]*/gi, '');
  
  // Remove markdown code blocks
  content = content.replace(/```json\s*/gi, '');
  content = content.replace(/```\s*/gi, '');
  
  // Remove any leading/trailing whitespace
  content = content.trim();
  
  // Try to find JSON object
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  // If no match found, try parsing the entire cleaned content
  return JSON.parse(content);
}

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const clientId=getClientId(req);
  if(!checkRequestLimit(clientId)){
    return NextResponse.json({error:"Daily request limit reached. Try again tomorrow."},{status:429});
  }

  // 2. Get form data
  const formData=await req.json();

  // 3. Basic validation
  if(!formData.name || !formData.age || !formData.fitnessGoal){
    return NextResponse.json({error:'Missing required fields'},{status:400});
  }
  if(formData.age<1 || formData.age>120){
    return NextResponse.json({error:'Age must be between 1 and 120'},{status:400});
  }
  if(!process.env.PPX_API){
    return NextResponse.json({error:"Perplexity API not configured"},{status:500});
  }

  // 4. Age-based and intensity-based exercise recommendations
  const age = Number(formData.age);
  const lifestyle = formData.lifestyle?.toLowerCase() || '';
  const isActiveUser = lifestyle.includes('active') || lifestyle.includes('very active') || lifestyle.includes('super active') || lifestyle.includes('athlete');
  
  let exerciseGuidelines = "";
  let intensityLevel = "";
  let exerciseCount = "";
  
  if (age >= 60) {
    exerciseGuidelines = `
    CRITICAL: For users 60+ years old, ONLY recommend:
    - Yoga poses and gentle stretching (3-4 exercises)
    - Walking, light jogging, or swimming
    - Chair exercises and free body movements
    - Balance and flexibility exercises
    - Breathing exercises and meditation
    - Light resistance bands (if needed)
    
    AVOID: Heavy gym machines, weights, high-intensity exercises
    `;
    intensityLevel = "gentle and low-impact";
    exerciseCount = "3-4 exercises per session";
  } else if (age >= 45) {
    if (isActiveUser) {
      exerciseGuidelines = `
      For ACTIVE users 45-59 years old, focus on:
      - 5-6 exercises per workout session
      - Mix of gym machines and free movements
      - Moderate to high cardio activities
      - Joint-friendly but challenging exercises
      - Include yoga and stretching
      - Progressive overload with proper form
      `;
      intensityLevel = "moderate to high with joint care";
      exerciseCount = "5-6 exercises per session";
    } else {
      exerciseGuidelines = `
      For users 45-59 years old, focus on:
      - 4-5 exercises per workout session
      - Mix of gym machines and free movements
      - Moderate cardio activities
      - Joint-friendly exercises
      - Include yoga and stretching
      - Emphasis on flexibility and mobility
      `;
      intensityLevel = "moderate with joint care";
      exerciseCount = "4-5 exercises per session";
    }
  } else {
    if (isActiveUser) {
      exerciseGuidelines = `
      For ACTIVE/SUPER ACTIVE users under 45, include:
      - 6-7 exercises per workout session (HIGH INTENSITY)
      - Full range of gym machines with compound movements
      - High intensity workouts with proper progression
      - Complex movement patterns and functional training
      - Sport-specific training if desired
      - Advanced techniques like supersets, drop sets
      - Higher training frequency possible
      `;
      intensityLevel = "high intensity for active individuals";
      exerciseCount = "6-7 exercises per session";
    } else {
      exerciseGuidelines = `
      For users under 45, can include:
      - 4-5 exercises per workout session
      - Full range of gym machines
      - Moderate to high intensity workouts
      - Progressive movement patterns
      - Building foundation strength
      `;
      intensityLevel = "moderate to high based on fitness level";
      exerciseCount = "4-5 exercises per session";
    }
  }

  // Enhanced prompt engineering with age-specific guidelines
  const userAnalysis=[
    `Age: ${formData.age}`,
    `Gender: ${formData.gender||'N/A'}`,
    formData.height?`Height: ${formData.height} cm`:'',
    formData.weight?`Weight: ${formData.weight} kg`:'',
    `Goal: ${formData.fitnessGoal}`,
    formData.lifestyle?`Lifestyle: ${formData.lifestyle}`:'',
    formData.medicalConditions?`Medical: ${formData.medicalConditions}`:'',
    formData.dietPreference?`Diet: ${formData.dietPreference}`:''
  ].filter(Boolean).join('; ');

  // Calculate BMI if both height and weight are provided
  let bmiInfo = '';
  if (formData.height && formData.weight) {
    const heightInMeters = Number(formData.height) / 100;
    const bmi = Number(formData.weight) / (heightInMeters * heightInMeters);
    bmiInfo = `BMI: ${bmi.toFixed(1)} (${bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'})`;
  }

  // Enhanced system prompt with age-specific guidelines
  const systemPrompt = `
You are an expert Indian fitness and nutrition specialist with special expertise in age-appropriate exercise. Generate ONLY valid JSON output - no thinking process, no explanations outside JSON, no markdown.

CRITICAL: Your response must be ONLY a valid JSON object starting with { and ending with }. Do not include any text before or after the JSON.

AGE-SPECIFIC EXERCISE GUIDELINES:
${exerciseGuidelines}

EXERCISE INTENSITY GUIDELINES:
- User lifestyle: ${formData.lifestyle || 'Not specified'}
- Recommended intensity: ${intensityLevel}
- Exercise count per session: ${exerciseCount}
- ${isActiveUser ? 'USER IS ACTIVE/SUPER ACTIVE - PROVIDE HIGH INTENSITY WORKOUTS WITH MORE EXERCISES' : 'USER HAS MODERATE ACTIVITY LEVEL'}

REQUIREMENTS:
1. Analyze user data and create unique personalized plans with ${intensityLevel} intensity
2. Include 3-4 alternatives for exercises, meals, supplements  
3. EXERCISE COUNT: Provide ${exerciseCount} based on age and activity level
4. For users UNDER 60: Use gym machines: Seated chest press, Pec-dec fly, Hip thrust, Multi hip, Leg extensions, Seated crunch, Leg press, Chest press adjustable, Multi purpose pullup machine, Cable cross machine, Lats pull down, Vertical leg raises/dips machine, Back rowing machine, Preacher curl
5. For users 60+: ONLY yoga, walking, swimming, chair exercises, free body movements, stretching, balance exercises
6. For ACTIVE users: Include compound movements, supersets, higher rep ranges, progressive overload
7. Diet in HINDI with English translation, focus on Indian regional cuisine
6. Focus on tier-3 Indian cities (budget-friendly, local ingredients)
7. Include Ayurvedic principles based on age and constitution
8. Show total daily macros and micros
9. Provide detailed reasoning for every recommendation
10. Consider medical conditions and modify accordingly

JSON STRUCTURE:
{
  "analysis_reasoning": "Detailed analysis considering age, goals, and Indian context",
  "plan_duration": "4-12 weeks based on user level and age",
  "workout_days": [
    {
      "name": "Day name (e.g., Upper Body Strength, Gentle Yoga Flow)",
      "day": "Day 1/2/3",
      "focus": "Muscle group focus or movement type",
      "reasoning": "Why this approach works for user's age and goals",
      "exercises": [
        {
          "name": "Age and intensity-appropriate exercise name",
          "alternatives": ["Alt1", "Alt2", "Alt3"],
          "prescription": "Sets x Reps or Duration (higher for active users)",
          "rest": "Rest duration (shorter for active users)",
          "reasoning": "Why this exercise suits user's age, activity level and condition",
          "notes": "Form tips, modifications, intensity adjustments"
        }
      ]
    }
  ],
  "cardio_plan": {
    "type": "Age-appropriate cardio (walking for seniors, varied for younger)",
    "frequency": "Weekly frequency based on age",
    "alternatives": ["Age-suitable alternatives"],
    "sessions": ["Specific session details with intensity"],
    "reasoning": "Why this cardio approach suits user's age"
  },
  "nutrition_plan": {
    "diet_type": "Based on user preference and Indian traditions",
    "total_macros": {
      "calories": "Age-adjusted daily calorie target",
      "protein": "Protein in grams (age-appropriate)",
      "carbs": "Carbs in grams", 
      "fats": "Fats in grams"
    },
    "total_micros": {
      "vitamins": "Age-specific vitamin focus (B12, D, calcium for seniors)",
      "minerals": "Key minerals needed based on age"
    },
    "meals": {
      "breakfast": {
        "hindi_name": "Traditional Hindi meal name",
        "english_name": "English translation",
        "ingredients": ["Local, budget-friendly ingredients"],
        "preparation": "Simple, age-appropriate preparation method",
        "reasoning": "Why this meal suits user's age, goal, and region",
        "alternatives": ["Regional alternatives", "Seasonal options", "Budget options"]
      },
      "lunch": {
        "hindi_name": "Traditional Hindi meal name",
        "english_name": "English translation", 
        "ingredients": ["Local, seasonal ingredients"],
        "preparation": "Traditional cooking method",
        "reasoning": "Nutritional and cultural reasoning",
        "alternatives": ["Regional variations", "Dietary modifications", "Quick options"]
      },
      "dinner": {
        "hindi_name": "Traditional Hindi meal name",
        "english_name": "English translation",
        "ingredients": ["Easily digestible ingredients for age"], 
        "preparation": "Light, healthy preparation",
        "reasoning": "Why this dinner suits user's age and goals",
        "alternatives": ["Lighter options", "Regional dishes", "Protein variations"]
      },
      "snacks": {
        "hindi_name": "Traditional Hindi snack name",
        "english_name": "English translation",
        "ingredients": ["Healthy, local ingredients"],
        "preparation": "Simple preparation",
        "reasoning": "Why this snack helps with goals",
        "alternatives": ["Seasonal fruits", "Nuts/seeds", "Traditional options"]
      }
    },
    "ayurvedic_notes": ["Age-specific Ayurvedic principles", "Dosha balancing for age", "Seasonal eating tips"],
    "budget_tips": ["Local market tips", "Seasonal buying advice", "Bulk preparation ideas"],
    "local_alternatives": ["Regional Indian alternatives", "Tier-3 city options", "Traditional preparations"]
  },
  "supplements": [
    {
      "name": "Age-appropriate supplement (seniors need D3, B12, calcium)",
      "reasoning": "Why user's age and condition needs this",
      "alternatives": ["Natural food sources", "Traditional remedies", "Ayurvedic options"],
      "dosage": "Age-appropriate recommended amount",
      "timing": "Best time to take based on age and digestion"
    }
  ],
  "lifestyle_recommendations": [
    {
      "category": "Sleep/Stress/Hydration/Social (age-relevant)",
      "recommendations": ["Age-specific lifestyle advice", "Cultural considerations"],
      "reasoning": "Why important for user's age and Indian lifestyle"
    }
  ],
  "progression": "How user should progress safely based on age and starting level",
  "precautions": ["Age-specific safety notes", "Medical considerations", "Warning signs to watch"],
  "alternatives_summary": "Overview of all alternative options provided with age considerations"
}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.
  `;

  const userPrompt = `
Create a personalized plan for: ${userAnalysis}
${bmiInfo ? `${bmiInfo}` : ''}

IMPORTANT: 
- User is ${age} years old
- Activity level: ${formData.lifestyle || 'Not specified'} ${isActiveUser ? '(HIGH ACTIVITY - INCREASE INTENSITY)' : '(MODERATE ACTIVITY)'}
- Exercise count: ${exerciseCount}
- ${age >= 60 ? 'ONLY recommend yoga, walking, swimming, chair exercises, and gentle movements. NO gym machines or weights.' : age >= 45 ? 'Focus on joint-friendly exercises with appropriate intensity for activity level.' : 'Can include full range of exercises. For active users, provide challenging workouts with 6-7 exercises.'}

${isActiveUser ? 'USER IS VERY ACTIVE - Provide high intensity workouts with compound movements, supersets, higher rep ranges, and challenging progressions.' : ''}

Respond with ONLY valid JSON. No explanations outside the JSON structure.
  `;

  // 5. Perplexity API Call with adjusted parameters
  const payload = {
    model: "sonar-reasoning-pro",
    messages: [
      {role:"system", content:systemPrompt},
      {role:"user", content:userPrompt}
    ],
    max_tokens: 4000,
    temperature: 0.7, // Reduced for more consistent formatting
    top_p: 0.9,      // Reduced for more focused responses
    stream: false
  };

  try{
    const resp = await fetch("https://api.perplexity.ai/chat/completions",{
      method:'POST',
      headers:{
        "Authorization":`Bearer ${process.env.PPX_API}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(payload)
    });

    if(!resp.ok){
      const errTxt = await resp.text();
      return NextResponse.json({error:`AI response failed: ${resp.statusText} ${errTxt}`},{status:500});
    }
    
    const data = await resp.json();
    let content = data.choices?.[0]?.message?.content||"";
    
    console.log("Raw AI Response (first 500 chars):", content.substring(0, 500));
    
    // Enhanced JSON extraction
    let plan;
    try{
      plan = extractJSON(content);
      console.log("Successfully parsed plan with keys:", Object.keys(plan));
      
      // Validate that essential fields exist
      if (!plan.analysis_reasoning || !plan.workout_days) {
        throw new Error("Missing essential plan components");
      }
      
      // Additional validation for age-appropriate content
      if (age >= 60) {
        // Check if plan contains inappropriate exercises for seniors
        const hasHeavyExercises = JSON.stringify(plan).toLowerCase().includes('chest press') || 
                                 JSON.stringify(plan).toLowerCase().includes('leg press') ||
                                 JSON.stringify(plan).toLowerCase().includes('weights');
        
        if (hasHeavyExercises) {
          console.log("Warning: Plan contains heavy exercises for senior user");
          // Could modify the plan here or request regeneration
        }
      }
      
      return NextResponse.json({plan});
      
    }catch(jsonerr: unknown){
      console.log("JSON Parse Error:", jsonerr);
      console.log("Content after cleaning:", content.substring(0, 1000));
      
      // Last resort: try to build a minimal plan from available content
      try {
        // Look for any JSON-like structure in the response
        const fallbackMatch = content.match(/\{[^{}]*"analysis_reasoning"[^{}]*\}/);
        if (fallbackMatch) {
          const fallbackPlan = JSON.parse(fallbackMatch[0]);
          return NextResponse.json({plan: fallbackPlan});
        }
      } catch (fallbackErr) {
        console.log("Fallback parsing also failed:", fallbackErr);
      }
      
      return NextResponse.json({
        plan: null, 
        rawContent: content.substring(0, 1500), 
        parseError: "AI response format error. Please try again.",
        error: jsonerr instanceof Error ? jsonerr.message : "Parsing failed",
        suggestion: "The AI model returned an unexpected format. Try submitting your request again."
      }, {status: 200});
    }
  }catch(err){
    console.log("API Fetch error:", err);
    return NextResponse.json({
      error: "Failed to connect to AI service. Please try again.",
      details: err instanceof Error ? err.message : "Unknown error"
    },{status:500});
  }
}