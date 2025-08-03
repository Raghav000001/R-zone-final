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

// Enhanced JSON extraction function with multiple fallback strategies
function extractJSON(content: string): any {
  console.log("Raw content length:", content.length);
  console.log("First 200 chars:", content.substring(0, 200));
  console.log("Last 200 chars:", content.substring(content.length - 200));

  // Remove <think> tags and their content
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // Remove any remaining think tags (unclosed)
  content = content.replace(/<think>[\s\S]*/gi, '');
  
  // Remove markdown code blocks
  content = content.replace(/```json\s*/gi, '');
  content = content.replace(/```\s*/gi, '');
  
  // Remove any leading/trailing whitespace
  content = content.trim();
  
  // Strategy 1: Look for the largest JSON object
  const jsonMatches = content.match(/\{[\s\S]*?\}/g);
  if (jsonMatches && jsonMatches.length > 0) {
    // Sort by length, try the longest first
    const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
    
    for (const match of sortedMatches) {
      try {
        const parsed = JSON.parse(match);
        // Validate it's a workout plan (has expected structure)
        if (parsed.analysis_reasoning || parsed.workout_days || parsed.nutrition_plan) {
          console.log("Successfully found valid plan JSON");
          return parsed;
        }
      } catch (e) {
        console.log("Failed to parse match:", match.substring(0, 100));
        continue;
      }
    }
  }
  
  // Strategy 2: Try to find JSON between specific markers
  const betweenBraces = content.match(/\{[\s\S]*\}/);
  if (betweenBraces) {
    try {
      const parsed = JSON.parse(betweenBraces[0]);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch (e) {
      console.log("Strategy 2 failed:", e);
    }
  }
  
  // Strategy 3: Clean up common issues and try again
  let cleanContent = content
    .replace(/^[^{]*/, '') // Remove everything before first {
    .replace(/[^}]*$/, '') // Remove everything after last }
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/,\s*}/g, '}') // Remove trailing commas
    .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
  
  if (cleanContent.startsWith('{') && cleanContent.endsWith('}')) {
    try {
      return JSON.parse(cleanContent);
    } catch (e) {
      console.log("Strategy 3 failed:", e);
    }
  }
  
  // If all strategies fail, throw with detailed info
  throw new Error(`Could not extract valid JSON. Content preview: ${content.substring(0, 500)}`);
}

// Fallback plan generator for when AI fails
function generateFallbackPlan(formData: any): any {
  const age = Number(formData.age);
  const isYounger = age < 45;
  const isSenior = age >= 60;
  
  return {
    analysis_reasoning: `Based on your profile (Age: ${formData.age}, Goal: ${formData.fitnessGoal}), this is a personalized plan focusing on gradual progression and Indian dietary preferences. This fallback plan ensures you have a safe starting point while we work on improving our AI recommendations.`,
    plan_duration: "4-6 weeks",
    workout_days: [
      {
        name: isSenior ? "Gentle Movement Day" : "Upper Body Strength",
        day: "Day 1",
        focus: isSenior ? "Flexibility and balance" : "Chest, shoulders, arms",
        reasoning: isSenior ? "Gentle movements to maintain mobility and strength" : "Building upper body strength for daily activities",
        exercises: isSenior ? [
          {
            name: "Chair-supported stretches",
            alternatives: ["Wall stretches", "Bed stretches", "Standing stretches"],
            prescription: "5-8 gentle stretches",
            rest: "30 seconds between stretches",
            reasoning: "Maintains flexibility and joint mobility safely",
            notes: "Move slowly and never force a stretch"
          },
          {
            name: "Walking in place",
            alternatives: ["Slow outdoor walk", "Marching", "Step touches"],
            prescription: "5-10 minutes",
            rest: "As needed",
            reasoning: "Low-impact cardio for heart health",
            notes: "Hold onto a chair if balance is needed"
          }
        ] : [
          {
            name: "Push-ups (modified if needed)",
            alternatives: ["Wall push-ups", "Incline push-ups", "Knee push-ups"],
            prescription: "2-3 sets of 8-12 reps",
            rest: "60 seconds",
            reasoning: "Builds chest and arm strength functionally",
            notes: "Start with easier variation and progress gradually"
          },
          {
            name: "Seated rows (resistance band)",
            alternatives: ["Bent-over rows", "Single-arm rows", "Inverted rows"],
            prescription: "2-3 sets of 10-15 reps",
            rest: "60 seconds",
            reasoning: "Strengthens back muscles for good posture",
            notes: "Squeeze shoulder blades together at the end"
          }
        ]
      }
    ],
    cardio_plan: {
      type: isSenior ? "Gentle walking" : "Moderate walking/jogging",
      frequency: isSenior ? "Daily 15-20 minutes" : "4-5 times per week, 25-30 minutes",
      alternatives: ["Swimming", "Cycling", "Dancing", "Yoga"],
      sessions: [isSenior ? "15-minute gentle walks after meals" : "25-minute brisk walks or light jogging"],
      reasoning: isSenior ? "Low-impact cardio suitable for seniors" : "Improves cardiovascular health and aids in achieving fitness goals"
    },
    nutrition_plan: {
      diet_type: formData.dietPreference || "Balanced Indian vegetarian",
      total_macros: {
        calories: isSenior ? "1600-1800 kcal" : "1800-2200 kcal",
        protein: isSenior ? "65-75g" : "80-100g",
        carbs: isSenior ? "180-200g" : "200-250g",
        fats: isSenior ? "50-60g" : "60-80g"
      },
      total_micros: {
        vitamins: isSenior ? "Focus on B12, D3, and calcium" : "Balanced multivitamin approach",
        minerals: "Iron, calcium, magnesium, zinc"
      },
      meals: {
        breakfast: {
          hindi_name: "दलिया उपमा",
          english_name: "Broken wheat upma",
          ingredients: ["Broken wheat", "Vegetables", "Mustard seeds", "Curry leaves", "Turmeric"],
          preparation: "Roast broken wheat, sauté vegetables with spices, mix and cook with water",
          reasoning: "High fiber, moderate protein, provides sustained energy",
          alternatives: ["Oats poha", "Vegetable paratha", "Idli sambhar"]
        },
        lunch: {
          hindi_name: "दाल चावल सब्जी",
          english_name: "Lentil rice with vegetables",
          ingredients: ["Rice", "Toor dal", "Seasonal vegetables", "Spices", "Ghee"],
          preparation: "Cook rice and dal separately, prepare vegetable curry, serve together",
          reasoning: "Complete protein, balanced macros, traditional and satisfying",
          alternatives: ["Rajma rice", "Chole rice", "Khichdi"]
        },
        dinner: {
          hindi_name: "रोटी सब्जी दाल",
          english_name: "Chapati with vegetables and lentils",
          ingredients: ["Whole wheat flour", "Mixed vegetables", "Moong dal", "Spices"],
          preparation: "Make fresh rotis, prepare light vegetable curry and dal",
          reasoning: "Light dinner, easy to digest, provides necessary nutrients",
          alternatives: ["Vegetable soup with bread", "Light khichdi", "Salad with paneer"]
        },
        snacks: {
          hindi_name: "मिक्स नट्स और फल",
          english_name: "Mixed nuts and seasonal fruits",
          ingredients: ["Almonds", "Walnuts", "Seasonal fruits", "Green tea"],
          preparation: "Soak nuts overnight, have with fresh fruits",
          reasoning: "Healthy fats, natural sugars, vitamins and minerals",
          alternatives: ["Roasted chana", "Fruit smoothie", "Vegetable juice"]
        }
      },
      ayurvedic_notes: [
        "Eat according to your body constitution (Vata, Pitta, Kapha)",
        "Have largest meal at lunch when digestion is strongest",
        "Include all six tastes in your daily diet"
      ],
      budget_tips: [
        "Buy seasonal vegetables and fruits",
        "Purchase lentils and grains in bulk",
        "Use local and regional ingredients"
      ],
      local_alternatives: [
        "Use regional vegetables and preparations",
        "Adapt recipes to local taste preferences",
        "Include traditional family recipes"
      ]
    },
    supplements: [
      {
        name: isSenior ? "Vitamin D3 and B12" : "Multivitamin",
        reasoning: isSenior ? "Essential for bone health and energy in seniors" : "Fills nutritional gaps in regular diet",
        alternatives: ["Sunlight exposure", "Fortified foods", "Natural food sources"],
        dosage: isSenior ? "D3: 1000 IU, B12: 250 mcg daily" : "As per manufacturer instructions",
        timing: "With breakfast for better absorption"
      }
    ],
    lifestyle_recommendations: [
      {
        category: "Sleep",
        recommendations: ["7-8 hours of quality sleep", "Regular sleep schedule", "Avoid screens before bed"],
        reasoning: "Good sleep is crucial for recovery and overall health"
      },
      {
        category: "Stress Management",
        recommendations: ["Daily meditation or deep breathing", "Regular social connections", "Pursue hobbies"],
        reasoning: "Managing stress improves both physical and mental health"
      }
    ],
    progression: "Start with the basic plan for 2 weeks, then gradually increase intensity, duration, or add new exercises based on your comfort and progress.",
    precautions: [
      "Consult a doctor before starting any new exercise program",
      "Start slowly and listen to your body",
      "Stay hydrated during workouts",
      "Stop if you feel dizzy or unwell"
    ],
    alternatives_summary: "This plan provides multiple alternatives for exercises, meals, and supplements to suit your preferences, budget, and local availability. Feel free to mix and match based on your needs."
  };
}

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const clientId=getClientId(req);
  if(!checkRequestLimit(clientId)){
    return NextResponse.json({error:"Daily request limit reached. Try again tomorrow."},{status:429});
  }

  // 2. Get form data
  let formData;
  try {
    formData = await req.json();
  } catch (error) {
    return NextResponse.json({error:'Invalid request format'},{status:400});
  }

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

  // Simplified system prompt for better JSON compliance
  const systemPrompt = `You are an expert Indian fitness and nutrition specialist. 

CRITICAL: Your response must be ONLY a valid JSON object. Start with { and end with }. No other text, explanations, or markdown.

AGE-SPECIFIC GUIDELINES:
${exerciseGuidelines}

INTENSITY: ${intensityLevel}
EXERCISE COUNT: ${exerciseCount}

Create a JSON response with this EXACT structure:
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
}

RESPOND WITH ONLY THE JSON OBJECT.`;

  const userPrompt = `Create plan for: ${userAnalysis} ${bmiInfo ? `${bmiInfo}` : ''}

Age: ${age} years, Activity: ${formData.lifestyle || 'Not specified'}, Exercise count: ${exerciseCount}

JSON only. No explanations.`;

  // 5. Perplexity API Call with better error handling
  const payload = {
    model: "sonar-reasoning-pro",
    messages: [
      {role:"system", content:systemPrompt},
      {role:"user", content:userPrompt}
    ],
    max_tokens: 4000,
    temperature: 0.3, // Lower temperature for more consistent formatting
    top_p: 0.8,      
    stream: false
  };

  try {
    console.log("Making API request to Perplexity...");
    
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
      console.error("Perplexity API error:", resp.status, resp.statusText, errTxt);
      
      // Return fallback plan instead of error
      console.log("API failed, using fallback plan");
      const fallbackPlan = generateFallbackPlan(formData);
      return NextResponse.json({
        plan: fallbackPlan,
        source: "fallback",
        message: "AI service temporarily unavailable. Using reliable fallback plan."
      });
    }
    
    const data = await resp.json();
    let content = data.choices?.[0]?.message?.content||"";
    
    console.log("Raw AI Response length:", content.length);
    
    if (!content || content.trim().length === 0) {
      console.log("Empty response from AI, using fallback");
      const fallbackPlan = generateFallbackPlan(formData);
      return NextResponse.json({
        plan: fallbackPlan,
        source: "fallback",
        message: "AI returned empty response. Using reliable fallback plan."
      });
    }
    
    // Try to extract and parse JSON
    let plan;
    try {
      plan = extractJSON(content);
      console.log("Successfully parsed plan with keys:", Object.keys(plan));
      
      // Validate that essential fields exist
      if (!plan.analysis_reasoning && !plan.workout_days && !plan.nutrition_plan) {
        throw new Error("Missing essential plan components");
      }
      
      // Additional validation for age-appropriate content
      if (age >= 60) {
        const hasHeavyExercises = JSON.stringify(plan).toLowerCase().includes('chest press') || 
                                 JSON.stringify(plan).toLowerCase().includes('leg press') ||
                                 JSON.stringify(plan).toLowerCase().includes('weights');
        
        if (hasHeavyExercises) {
          console.log("Warning: Plan contains heavy exercises for senior user, using fallback");
          const fallbackPlan = generateFallbackPlan(formData);
          return NextResponse.json({
            plan: fallbackPlan,
            source: "fallback",
            message: "AI plan contained inappropriate exercises for your age. Using safe fallback plan."
          });
        }
      }
      
      return NextResponse.json({
        plan,
        source: "ai",
        message: "Plan generated successfully by AI"
      });
      
    } catch(jsonerr: unknown) {
      console.log("JSON Parse Error:", jsonerr);
      console.log("Content preview:", content.substring(0, 500));
      
      // Use fallback plan instead of returning error
      console.log("JSON parsing failed, using fallback plan");
      const fallbackPlan = generateFallbackPlan(formData);
      return NextResponse.json({
        plan: fallbackPlan,
        source: "fallback",
        message: "AI response format error. Using reliable fallback plan.",
        debug: {
          error: jsonerr instanceof Error ? jsonerr.message : "Parsing failed",
          contentPreview: content.substring(0, 300)
        }
      });
    }
    
  } catch(err) {
    console.error("API Fetch error:", err);
    
    // Use fallback plan for any fetch errors
    console.log("Fetch failed, using fallback plan");
    const fallbackPlan = generateFallbackPlan(formData);
    return NextResponse.json({
      plan: fallbackPlan,
      source: "fallback", 
      message: "Failed to connect to AI service. Using reliable fallback plan.",
      debug: {
        error: err instanceof Error ? err.message : "Unknown error"
      }
    });
  }
}