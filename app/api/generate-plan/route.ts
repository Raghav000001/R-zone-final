// app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from "next/server";

// Add this export to set maximum execution time
export const maxDuration = 300; // 5 minutes (adjust based on your hosting plan)

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
  console.log("Raw content length:", content.length);
  
  // Remove thinking tags
  if (content.includes('<think>')) {
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    content = content.replace(/<think>[\s\S]*?(?=\{)/gi, '');
    content = content.replace(/<\/?think>/gi, '');
  }
  
  content = content.trim();
  content = content.replace(/```json\s*/gi, '');
  content = content.replace(/```\s*/gi, '');
  
  const firstBraceIndex = content.indexOf('{');
  if (firstBraceIndex > 0) {
    content = content.substring(firstBraceIndex);
  }
  
  const lastBraceIndex = content.lastIndexOf('}');
  if (lastBraceIndex !== -1 && lastBraceIndex < content.length - 1) {
    content = content.substring(0, lastBraceIndex + 1);
  }
  
  content = content
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/\n\s*\n/g, '\n')
    .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
    .trim();
  
  if (!content.startsWith('{') || !content.endsWith('}')) {
    throw new Error(`Content doesn't look like JSON object. Starts with: ${content.substring(0, 50)}, Ends with: ${content.substring(content.length - 50)}`);
  }
  
  try {
    const parsed = JSON.parse(content);
    
    if (parsed && typeof parsed === 'object' && 
        (parsed.analysis_reasoning || parsed.workout_days || parsed.nutrition_plan)) {
      console.log("Successfully parsed valid plan JSON");
      return parsed;
    } else {
      throw new Error("Parsed JSON doesn't contain expected workout plan structure");
    }
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const lastAttempt = JSON.parse(jsonMatch[0]);
        if (lastAttempt && typeof lastAttempt === 'object') {
          return lastAttempt;
        }
      } catch (regexError) {
        console.error("Regex fallback also failed:", regexError);
      }
    }
    
    throw new Error(`Failed to parse JSON: ${parseError}`);
  }
}

export async function POST(req: NextRequest) {
  // Set headers to prevent timeout
  const headers = {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  try {
    // 1. Rate limit
    const clientId = getClientId(req);
    if (!checkRequestLimit(clientId)) {
      return NextResponse.json({error:"Daily request limit reached. Try again tomorrow."}, {status:429});
    }

    // 2. Get form data
    let formData;
    try {
      formData = await req.json();
    } catch (error) {
      return NextResponse.json({error:'Invalid request format'}, {status:400});
    }

    // 3. Basic validation
    if (!formData.name || !formData.age || !formData.fitnessGoal) {
      return NextResponse.json({error:'Missing required fields'}, {status:400});
    }
    if (formData.age < 1 || formData.age > 120) {
      return NextResponse.json({error:'Age must be between 1 and 120'}, {status:400});
    }
    if (!process.env.PPX_API) {
      return NextResponse.json({error:"Perplexity API not configured"}, {status:500});
    }

    // 4. Age-based guidelines (your existing logic)
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

    const userAnalysis = [
      `Age: ${formData.age}`,
      `Gender: ${formData.gender||'N/A'}`,
      formData.height?`Height: ${formData.height} cm`:'',
      formData.weight?`Weight: ${formData.weight} kg`:'',
      `Goal: ${formData.fitnessGoal}`,
      formData.lifestyle?`Lifestyle: ${formData.lifestyle}`:'',
      formData.medicalConditions?`Medical: ${formData.medicalConditions}`:'',
      formData.dietPreference?`Diet: ${formData.dietPreference}`:''
    ].filter(Boolean).join('; ');

    let bmiInfo = '';
    if (formData.height && formData.weight) {
      const heightInMeters = Number(formData.height) / 100;
      const bmi = Number(formData.weight) / (heightInMeters * heightInMeters);
      bmiInfo = `BMI: ${bmi.toFixed(1)} (${bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'})`;
    }

    const systemPrompt = `You are an expert Indian fitness and nutrition specialist.

CRITICAL RESPONSE RULES:
1. NEVER use <think> tags or any thinking process in your response
2. Your response must be ONLY a valid JSON object
3. Start immediately with { and end with }
4. No explanations, markdown, or additional text
5. Ensure all strings are properly quoted and escaped
6. No trailing commas in objects or arrays

AGE-SPECIFIC GUIDELINES:
${exerciseGuidelines}

INTENSITY: ${intensityLevel}
EXERCISE COUNT: ${exerciseCount}

Return ONLY this JSON structure (no other text):
{
  "analysis_reasoning": "string",
  "plan_duration": "string", 
  "workout_days": [{"name": "string", "day": "string", "focus": "string", "reasoning": "string", "exercises": [{"name": "string", "alternatives": ["string"], "prescription": "string", "rest": "string", "reasoning": "string", "notes": "string"}]}],
  "cardio_plan": {"type": "string", "frequency": "string", "alternatives": ["string"], "sessions": ["string"], "reasoning": "string"},
  "nutrition_plan": {"diet_type": "string", "total_macros": {"calories": "string", "protein": "string", "carbs": "string", "fats": "string"}, "total_micros": {"vitamins": "string", "minerals": "string"}, "meals": {"breakfast": {"hindi_name": "string", "english_name": "string", "ingredients": ["string"], "preparation": "string", "reasoning": "string", "alternatives": ["string"]}, "lunch": {"hindi_name": "string", "english_name": "string", "ingredients": ["string"], "preparation": "string", "reasoning": "string", "alternatives": ["string"]}, "dinner": {"hindi_name": "string", "english_name": "string", "ingredients": ["string"], "preparation": "string", "reasoning": "string", "alternatives": ["string"]}, "snacks": {"hindi_name": "string", "english_name": "string", "ingredients": ["string"], "preparation": "string", "reasoning": "string", "alternatives": ["string"]}}, "ayurvedic_notes": ["string"], "budget_tips": ["string"], "local_alternatives": ["string"]},
  "supplements": [{"name": "string", "reasoning": "string", "alternatives": ["string"], "dosage": "string", "timing": "string"}],
  "lifestyle_recommendations": [{"category": "string", "recommendations": ["string"], "reasoning": "string"}],
  "progression": "string",
  "precautions": ["string"],
  "alternatives_summary": "string"
}`;

    const userPrompt = `User Profile: ${userAnalysis} ${bmiInfo ? `${bmiInfo}` : ''}

Age: ${age} years, Activity Level: ${formData.lifestyle || 'Not specified'}, Exercise Count: ${exerciseCount}

Return only the JSON object, no thinking, no explanations.`;

    // 5. Enhanced Perplexity API Call with retry logic
    const payload = {
      model: "sonar-pro",
      messages: [
        {role:"system", content:systemPrompt},
        {role:"user", content:userPrompt}
      ],
      max_tokens: 4000,
      temperature: 0.3,
      top_p: 0.9,      
      stream: false
    };

    console.log("Making API request to Perplexity...");
    
    let lastError;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}`);
        
        // Create AbortController with longer timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`Request timeout after 4 minutes (attempt ${attempt})`);
          controller.abort();
        }, 240000); // 4 minutes timeout
        
        const resp = await fetch("https://api.perplexity.ai/chat/completions", {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${process.env.PPX_API}`,
            "Content-Type": "application/json",
            // Add keep-alive headers
            "Connection": "keep-alive",
            "Keep-Alive": "timeout=300"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!resp.ok) {
          const errTxt = await resp.text();
          console.error(`Perplexity API error (attempt ${attempt}):`, resp.status, resp.statusText, errTxt);
          
          // If it's a rate limit or temporary error, retry
          if ((resp.status === 429 || resp.status >= 500) && attempt < maxRetries) {
            console.log(`Retrying in 2 seconds... (attempt ${attempt + 1})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          // For client errors or final attempt, return error
          return NextResponse.json({
            error: `AI service error: ${resp.statusText}`,
            details: errTxt,
            attempt: attempt
          }, { status: resp.status, headers });
        }
        
        const data = await resp.json();
        let content = data.choices?.[0]?.message?.content || "";
        
        console.log(`Raw AI Response length (attempt ${attempt}):`, content.length);
        
        if (!content || content.trim().length === 0) {
          throw new Error("AI service returned empty response");
        }
        
        // Try to extract and parse JSON
        try {
          const plan = extractJSON(content);
          console.log("Successfully parsed plan with keys:", Object.keys(plan));
          
          // Validate essential fields
          if (!plan.analysis_reasoning && !plan.workout_days && !plan.nutrition_plan) {
            throw new Error("Missing essential plan components");
          }
          
          // Age-appropriate validation
          if (age >= 60) {
            const planStr = JSON.stringify(plan).toLowerCase();
            const hasHeavyExercises = planStr.includes('chest press') || 
                                     planStr.includes('leg press') ||
                                     planStr.includes('weights') ||
                                     planStr.includes('bench press') ||
                                     planStr.includes('deadlift');
            
            if (hasHeavyExercises) {
              console.log("Warning: Plan contains inappropriate exercises for senior user");
              return NextResponse.json({
                error: "Generated plan contained inappropriate exercises for your age. Please try again.",
                type: "age_validation_failed"
              }, { status: 400, headers });
            }
          }
          
          return NextResponse.json({
            plan,
            source: "ai",
            message: "Plan generated successfully by AI",
            attempt: attempt
          }, { headers });
          
        } catch (jsonError) {
          console.log(`JSON Parse Error (attempt ${attempt}):`, jsonError);
          
          if (attempt < maxRetries) {
            console.log("Retrying due to JSON parse error...");
            continue;
          }
          
          return NextResponse.json({
            error: "AI response format error. Please try again.",
            type: "parse_error",
            details: jsonError instanceof Error ? jsonError.message : "Parsing failed",
            attempt: attempt
          }, { status: 500, headers });
        }
        
      } catch (fetchError) {
        console.error(`API Fetch error (attempt ${attempt}):`, fetchError);
        lastError = fetchError;
        
        // Check if it's a timeout error
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.log(`Request timed out (attempt ${attempt})`);
          
          if (attempt < maxRetries) {
            console.log("Retrying due to timeout...");
            continue;
          }
          
          return NextResponse.json({
            error: "AI service is taking longer than expected. This might be due to high demand. Please try again in a few moments.",
            type: "timeout",
            attempt: attempt
          }, { status: 408, headers });
        }
        
        // For other errors, retry once
        if (attempt < maxRetries) {
          console.log(`Retrying due to fetch error... (attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }
    
    // If all retries failed
    return NextResponse.json({
      error: "Failed to connect to AI service after multiple attempts. Please try again.",
      type: "connection_error",
      details: lastError instanceof Error ? lastError.message : "Unknown error",
      attempts: maxRetries
    }, { status: 500, headers });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({
      error: "An unexpected error occurred. Please try again.",
      type: "unexpected_error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500, headers });
  }
}