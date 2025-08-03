"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Heart, Dumbbell, Apple, Shield, Clock, Star, Users, Zap, Target, Download, AlertCircle, CheckCircle } from "lucide-react";
import { ChangeEvent } from "react";

export interface WellnessFormData {
  name: string;
  age: string;
  gender: string;
  weight?: string;
  height?: string;
  fitnessGoal: string;
  lifestyle?: string;
  medicalConditions?: string;
  dietPreference?: string;
}

interface Exercise {
  name: string;
  alternatives: string[];
  prescription: string;
  rest: string;
  reasoning: string;
  notes?: string;
}

interface WorkoutDay {
  name: string;
  day?: string;
  focus: string;
  reasoning: string;
  exercises: Exercise[];
}

interface CardioPlan {
  type: string;
  frequency: string;
  alternatives: string[];
  sessions: string[];
  reasoning: string;
}

interface Meal {
  hindi_name: string;
  english_name: string;
  ingredients: string[];
  preparation: string;
  reasoning: string;
  alternatives: string[];
}

interface NutritionPlan {
  diet_type: string;
  total_macros: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  total_micros: {
    vitamins: string;
    minerals: string;
  };
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
  ayurvedic_notes: string[];
  budget_tips: string[];
  local_alternatives: string[];
}

interface Supplement {
  name: string;
  reasoning: string;
  alternatives: string[];
  dosage: string;
  timing: string;
}

interface LifestyleRecommendation {
  category: string;
  recommendations: string[];
  reasoning: string;
}

interface AIPlan {
  analysis_reasoning: string;
  plan_duration: string;
  workout_days: WorkoutDay[];
  cardio_plan: CardioPlan;
  nutrition_plan: NutritionPlan;
  supplements: Supplement[];
  lifestyle_recommendations: LifestyleRecommendation[];
  progression: string;
  precautions: string[];
  alternatives_summary: string;
}

interface APIResponse {
  plan: AIPlan | null;
  source?: 'ai' | 'fallback';
  message?: string;
  debug?: any;
  parseError?: string;
  error?: string;
}

export default function AIPlanner() {
  const [formData, setFormData] = useState<WellnessFormData>({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    lifestyle: "",
    medicalConditions: "",
    dietPreference: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAIPlan] = useState<AIPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planSource, setPlanSource] = useState<'ai' | 'fallback' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [showPlan, setShowPlan] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check daily usage on component mount (fallback to in-memory if localStorage fails)
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const usage = parseInt(localStorage.getItem(`usage_${today}`) || '0');
      setDailyUsage(usage);
    } catch (e) {
      console.log("localStorage not available, using in-memory storage");
      setDailyUsage(0);
    }
  }, []);

  const updateDailyUsage = () => {
    const today = new Date().toDateString();
    const newUsage = dailyUsage + 1;
    setDailyUsage(newUsage);
    try {
      localStorage.setItem(`usage_${today}`, newUsage.toString());
    } catch (e) {
      console.log("localStorage not available for usage tracking");
    }
  };

  const handleInputChange = (field: keyof WellnessFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setStatusMessage(null);
  };

  const generatePlan = async () => {
    if (dailyUsage >= 10) {
      setError("Daily limit of 10 plans reached. Try again tomorrow!");
      return;
    }

    if (!formData.name || !formData.age || !formData.fitnessGoal) {
      setError("Please fill in all required fields (Name, Age, Goal)");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessage(null);
    setAIPlan(null);
    setShowPlan(false);
    setPlanSource(null);

    try {
      // Create AbortController for client-side timeout - increased for production
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout for production
      
      const resp = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          weight: formData.weight ? Number(formData.weight) : undefined,
          height: formData.height ? Number(formData.height) : undefined,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = { error: `Server error: ${resp.status} ${resp.statusText}` };
        }
        throw new Error(errorData.error || "Failed to generate plan!");
      }
      
      const data: APIResponse = await resp.json();
      
      if (data.plan) {
        setAIPlan(data.plan);
        setPlanSource(data.source || 'ai');
        setStatusMessage(data.message || null);
        setShowPlan(true);
        updateDailyUsage();
        
        // Show status message based on source
        if (data.source === 'fallback') {
          setStatusMessage(data.message || "Using reliable backup plan due to AI service issues.");
        } else {
          setStatusMessage("Your personalized AI plan is ready!");
        }
        
        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(data.error || data.parseError || "No plan received from service");
      }
    } catch (err: any) {
      console.error("Plan generation error:", err);
      
      // Handle timeout specifically
      if (err.name === 'AbortError') {
        setError("The AI service is taking longer than expected. Please wait a moment and try again.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!aiPlan) return;
    
    setIsDownloading(true);
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          // Check if we need a new page
          if (y + (i * 5) > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(lines[i], x, y + (i * 5));
        }
        return y + (lines.length * 5) + 3;
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${planSource === 'fallback' ? 'Expert' : 'AI'} Fitness & Nutrition Plan`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // User Info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${formData.name}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Age: ${formData.age} | Goal: ${formData.fitnessGoal}`, margin, yPosition);
      yPosition += 8;
      if (formData.weight && formData.height) {
        pdf.text(`Weight: ${formData.weight}kg | Height: ${formData.height}cm`, margin, yPosition);
        yPosition += 8;
      }
      if (planSource === 'fallback') {
        pdf.setFontSize(10);
        pdf.text('* This is an expert-designed backup plan - completely safe and effective', margin, yPosition);
        yPosition += 8;
      }
      yPosition += 5;

      // Analysis
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${planSource === 'fallback' ? 'Expert' : 'AI'} Analysis & Reasoning`, margin, yPosition);
      yPosition += 8;
      yPosition = addWrappedText(aiPlan.analysis_reasoning, margin, yPosition, pageWidth - 2 * margin, 10);
      yPosition += 5;

      // Workout Plan
      if (aiPlan.workout_days && aiPlan.workout_days.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Workout Plan', margin, yPosition);
        yPosition += 10;

        aiPlan.workout_days.forEach((workout, idx) => {
          // Check for new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${workout.name} - ${workout.focus}`, margin, yPosition);
          yPosition += 8;

          workout.exercises.forEach((exercise, i) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${i + 1}. ${exercise.name}`, margin + 5, yPosition);
            yPosition += 5;
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${exercise.prescription} | Rest: ${exercise.rest}`, margin + 10, yPosition);
            yPosition += 5;
            
            yPosition = addWrappedText(exercise.reasoning, margin + 10, yPosition, pageWidth - 2 * margin - 10, 9);
            yPosition += 3;
          });
          yPosition += 5;
        });
      }

      // Nutrition Plan
      if (aiPlan.nutrition_plan) {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nutrition Plan', margin, yPosition);
        yPosition += 10;

        // Macros
        pdf.setFontSize(11);
        pdf.text('Daily Macros:', margin, yPosition);
        yPosition += 6;
        pdf.setFontSize(10);
        const macros = aiPlan.nutrition_plan.total_macros;
        pdf.text(`Calories: ${macros.calories} | Protein: ${macros.protein} | Carbs: ${macros.carbs} | Fats: ${macros.fats}`, margin + 5, yPosition);
        yPosition += 10;

        // Meals
        Object.entries(aiPlan.nutrition_plan.meals).forEach(([mealTime, meal]: [string, any]) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}:`, margin, yPosition);
          yPosition += 6;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${meal.hindi_name} (${meal.english_name})`, margin + 5, yPosition);
          yPosition += 5;

          pdf.text(`Ingredients: ${meal.ingredients.join(', ')}`, margin + 5, yPosition);
          yPosition += 5;

          yPosition = addWrappedText(`Preparation: ${meal.preparation}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
          yPosition += 5;
        });
      }

      // Supplements
      if (aiPlan.supplements && aiPlan.supplements.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Supplements', margin, yPosition);
        yPosition += 10;

        aiPlan.supplements.forEach((supplement, i) => {
          if (yPosition > pageHeight - 25) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${i + 1}. ${supplement.name}`, margin, yPosition);
          yPosition += 5;

          pdf.setFont('helvetica', 'normal');
          pdf.text(`Dosage: ${supplement.dosage} | Timing: ${supplement.timing}`, margin + 5, yPosition);
          yPosition += 5;

          yPosition = addWrappedText(supplement.reasoning, margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
          yPosition += 8;
        });
      }

      // Precautions
      if (aiPlan.precautions && aiPlan.precautions.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Safety Precautions', margin, yPosition);
        yPosition += 10;

        aiPlan.precautions.forEach((precaution, i) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }

          yPosition = addWrappedText(`• ${precaution}`, margin, yPosition, pageWidth - 2 * margin, 10);
          yPosition += 3;
        });
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated by ${planSource === 'fallback' ? 'Expert' : 'AI'} Fitness Planner - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      pdf.save(`${formData.name}_Fitness_Plan.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const MacroCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: string, color: string }) => (
    <div className={`bg-gradient-to-br ${color} p-4 rounded-xl shadow-lg border border-white/10`}>
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6 text-white" />
        <div>
          <div className="text-white/80 text-sm font-medium">{title}</div>
          <div className="text-white text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">AI-Powered Fitness & Nutrition</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 leading-tight">
              Your Personal
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI Trainer</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Get personalized Indian fitness and diet plans tailored specifically for your goals, lifestyle, and preferences
            </p>
            <div className="flex justify-center items-center space-x-8 text-white/60">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">10,000+ Plans Generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">AI-Powered Insights</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
            {/* Usage Counter */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Create Your Plan</h2>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-white/70 text-sm">
                  Plans used today: <span className="font-bold text-white">{dailyUsage}/10</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="group">
                    <Label className="text-white/80 text-sm font-medium">Full Name *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                      className="mt-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl transition-all duration-200 group-hover:bg-white/10"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <Label className="text-white/80 text-sm font-medium">Age *</Label>
                      <Input 
                        type="number" 
                        value={formData.age} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("age", e.target.value)}
                        className="mt-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl transition-all duration-200 group-hover:bg-white/10"
                        placeholder="25"
                      />
                    </div>
                    <div className="group">
                      <Label className="text-white/80 text-sm font-medium">Gender *</Label>
                      <Select onValueChange={(value: string) => handleInputChange("gender", value)}>
                        <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <Label className="text-white/80 text-sm font-medium">Weight (kg)</Label>
                      <Input 
                        type="number" 
                        value={formData.weight} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("weight", e.target.value)}
                        className="mt-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl transition-all duration-200 group-hover:bg-white/10"
                        placeholder="70"
                      />
                    </div>
                    <div className="group">
                      <Label className="text-white/80 text-sm font-medium">Height (cm)</Label>
                      <Input 
                        type="number" 
                        value={formData.height} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("height", e.target.value)}
                        className="mt-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl transition-all duration-200 group-hover:bg-white/10"
                        placeholder="170"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals & Preferences */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Goals & Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <Label className="text-white/80 text-sm font-medium">Fitness Goal *</Label>
                    <Select onValueChange={(value: string) => handleInputChange("fitnessGoal", value)}>
                      <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="muscle">💪 Muscle Building</SelectItem>
                        <SelectItem value="weight-loss">🔥 Fat Loss</SelectItem>
                        <SelectItem value="general">⚡ General Fitness</SelectItem>
                        <SelectItem value="strength">🏋️ Strength Training</SelectItem>
                        <SelectItem value="endurance">🏃 Endurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="group">
                    <Label className="text-white/80 text-sm font-medium">Diet Preference</Label>
                    <Select onValueChange={(value: string) => handleInputChange("dietPreference", value)}>
                      <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Vegetarian">🥬 Vegetarian</SelectItem>
                        <SelectItem value="Non-Vegetarian">🍖 Non-Vegetarian</SelectItem>
                        <SelectItem value="Vegan">🌱 Vegan</SelectItem>
                        <SelectItem value="Flexible">🍽️ Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="group">
                    <Label className="text-white/80 text-sm font-medium">Lifestyle</Label>
                    <Input 
                      value={formData.lifestyle} 
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("lifestyle", e.target.value)}
                      className="mt-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl transition-all duration-200 group-hover:bg-white/10"
                      placeholder="e.g., Sedentary, Active, Very Active"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="space-y-4 lg:col-span-2 xl:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Medical Information</h3>
                </div>

                <div className="group">
                  <Label className="text-white/80 text-sm font-medium">Medical Conditions (Optional)</Label>
                  <Textarea 
                    rows={4} 
                    value={formData.medicalConditions}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("medicalConditions", e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl transition-all duration-200 group-hover:bg-white/10"
                    placeholder="List any medical conditions, injuries, or limitations..."
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col items-center space-y-4 mt-8">
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 min-w-64" 
                disabled={isGenerating || dailyUsage >= 10} 
                onClick={generatePlan}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Creating Your Plan...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5" />
                    <span>Generate My Personal Plan</span>
                  </div>
                )}
              </Button>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-center max-w-md">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Response */}
          {aiPlan && showPlan && (
            <div id="results" className="space-y-8 animate-in fade-in duration-1000">
              {/* Success Banner */}
              <div className={`bg-gradient-to-r ${planSource === 'fallback' ? 'from-amber-500/20 to-orange-500/20 border-amber-500/30' : 'from-green-500/20 to-emerald-500/20 border-green-500/30'} backdrop-blur-sm border rounded-2xl p-6 text-center`}>
                <div className="flex items-center justify-center space-x-3 mb-2">
                  {planSource === 'fallback' ? (
                    <>
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                      <h2 className="text-2xl font-bold text-white">Reliable Backup Plan Ready!</h2>
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <h2 className="text-2xl font-bold text-white">Your Personalized Plan is Ready!</h2>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </>
                  )}
                </div>
                <p className={`${planSource === 'fallback' ? 'text-amber-200/80' : 'text-green-200/80'}`}>
                  {statusMessage || (planSource === 'fallback' ? 'AI service had issues, but we\'ve created a reliable plan for you' : 'AI has analyzed your profile and created a custom plan just for you')}
                </p>
                {planSource === 'fallback' && (
                  <div className="mt-3 text-amber-200/60 text-sm">
                    This backup plan is created by fitness experts and is completely safe to follow
                  </div>
                )}
              </div>

              {/* Analysis & Reasoning */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-3 bg-gradient-to-r ${planSource === 'fallback' ? 'from-amber-500/20 to-orange-500/20' : 'from-amber-500/20 to-orange-500/20'} rounded-xl`}>
                    <Heart className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {planSource === 'fallback' ? 'Expert Analysis & Recommendations' : 'AI Analysis & Insights'}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {planSource === 'fallback' ? 'Professional recommendations based on your profile' : 'Personalized recommendations based on your profile'}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                  <p className="text-white/90 leading-relaxed">{aiPlan.analysis_reasoning}</p>
                  <div className="mt-4 flex items-center space-x-2 text-amber-200">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Plan Duration: {aiPlan.plan_duration}</span>
                  </div>
                  {planSource === 'fallback' && (
                    <div className="mt-3 flex items-center space-x-2 text-amber-300/80">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Expert-designed backup plan - completely safe and effective</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workout Plan */}
              {aiPlan.workout_days && aiPlan.workout_days.length > 0 && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl">
                      <Dumbbell className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Your Workout Plan</h3>
                      <p className="text-white/60 text-sm">Customized exercises for your goals</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {aiPlan.workout_days.map((workout: WorkoutDay, idx: number) => (
                      <div key={idx} className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-orange-300">{workout.name}</h4>
                            {workout.day && <span className="text-orange-200/70 text-sm">{workout.day}</span>}
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span className="inline-flex items-center bg-orange-500/20 text-orange-200 text-xs font-medium px-3 py-1 rounded-full">
                              Focus: {workout.focus}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-white/70 text-sm mb-4 italic">{workout.reasoning}</p>
                        
                        <div className="space-y-4">
                          {workout.exercises.map((exercise: Exercise, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                                <h5 className="font-semibold text-green-300 text-lg">{exercise.name}</h5>
                                <div className="flex flex-col sm:flex-row sm:space-x-4 mt-2 sm:mt-0 text-sm">
                                  <span className="text-white/80 bg-white/10 px-2 py-1 rounded">{exercise.prescription}</span>
                                  <span className="text-white/80 bg-white/10 px-2 py-1 rounded mt-1 sm:mt-0">Rest: {exercise.rest}</span>
                                </div>
                              </div>
                              
                              <p className="text-white/70 text-sm mb-3">{exercise.reasoning}</p>
                              
                              {exercise.alternatives && exercise.alternatives.length > 0 && (
                                <div className="mb-3">
                                  <span className="text-yellow-300 text-sm font-medium">Alternatives: </span>
                                  <span className="text-yellow-200/80 text-sm">{exercise.alternatives.join(', ')}</span>
                                </div>
                              )}
                              
                              {exercise.notes && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                  <span className="text-blue-300 text-sm font-medium">💡 Pro Tip: </span>
                                  <span className="text-blue-200/80 text-sm">{exercise.notes}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cardio Plan */}
              {aiPlan.cardio_plan && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl">
                      <Heart className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Cardio & Conditioning</h3>
                      <p className="text-white/60 text-sm">Heart-healthy cardio recommendations</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-teal-300 font-semibold">Type:</span>
                            <span className="text-white">{aiPlan.cardio_plan.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-teal-300 font-semibold">Frequency:</span>
                            <span className="text-white">{aiPlan.cardio_plan.frequency}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-teal-300 font-semibold mb-2">Alternatives:</div>
                        <div className="flex flex-wrap gap-2">
                          {aiPlan.cardio_plan.alternatives.map((alt, i) => (
                            <span key={i} className="bg-teal-500/20 text-teal-200 text-xs px-2 py-1 rounded-full">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-4 italic">{aiPlan.cardio_plan.reasoning}</p>
                    
                    {aiPlan.cardio_plan.sessions && aiPlan.cardio_plan.sessions.length > 0 && (
                      <div>
                        <div className="text-teal-300 font-semibold mb-3">Session Details:</div>
                        <div className="space-y-2">
                          {aiPlan.cardio_plan.sessions.map((session, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <span className="text-white/90 text-sm">{session}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nutrition Plan */}
              {aiPlan.nutrition_plan && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-lime-500/20 to-green-500/20 rounded-xl">
                      <Apple className="w-6 h-6 text-lime-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Nutrition Plan</h3>
                      <p className="text-white/60 text-sm">Personalized Indian diet recommendations</p>
                    </div>
                  </div>
                  
                  {/* Macros & Micros */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MacroCard 
                      icon={Zap} 
                      title="Calories" 
                      value={aiPlan.nutrition_plan.total_macros.calories} 
                      color="from-red-500/20 to-orange-500/20" 
                    />
                    <MacroCard 
                      icon={Dumbbell} 
                      title="Protein" 
                      value={aiPlan.nutrition_plan.total_macros.protein} 
                      color="from-blue-500/20 to-cyan-500/20" 
                    />
                    <MacroCard 
                      icon={Apple} 
                      title="Carbs" 
                      value={aiPlan.nutrition_plan.total_macros.carbs} 
                      color="from-green-500/20 to-emerald-500/20" 
                    />
                    <MacroCard 
                      icon={Heart} 
                      title="Fats" 
                      value={aiPlan.nutrition_plan.total_macros.fats} 
                      color="from-purple-500/20 to-pink-500/20" 
                    />
                  </div>

                  {/* Meals */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-lime-300 mb-4">Daily Meal Plan</h4>
                    {Object.entries(aiPlan.nutrition_plan.meals).map(([mealTime, meal]: [string, Meal]) => (
                      <div key={mealTime} className="bg-gradient-to-r from-lime-500/10 to-green-500/10 border border-lime-500/20 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div>
                            <h5 className="text-xl font-bold text-lime-300 capitalize">{mealTime}</h5>
                            <div className="text-lg text-yellow-300 font-medium">{meal.hindi_name}</div>
                            <div className="text-white/80">{meal.english_name}</div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span className="inline-flex items-center bg-lime-500/20 text-lime-200 text-xs font-medium px-3 py-1 rounded-full">
                              Indian Traditional
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <div className="text-white/80 font-medium mb-2">🥘 Ingredients:</div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {meal.ingredients.map((ingredient, i) => (
                                <span key={i} className="bg-white/10 text-white/90 text-xs px-2 py-1 rounded-full">
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                            
                            <div className="text-white/80 font-medium mb-2">👩‍🍳 Preparation:</div>
                            <p className="text-white/70 text-sm mb-4">{meal.preparation}</p>
                          </div>
                          
                          <div>
                            <div className="text-white/80 font-medium mb-2">💡 Why This Meal:</div>
                            <p className="text-white/70 text-sm mb-4">{meal.reasoning}</p>
                            
                            {meal.alternatives && meal.alternatives.length > 0 && (
                              <div>
                                <div className="text-yellow-300 font-medium mb-2">🔄 Alternatives:</div>
                                <div className="flex flex-wrap gap-2">
                                  {meal.alternatives.map((alt, i) => (
                                    <span key={i} className="bg-yellow-500/20 text-yellow-200 text-xs px-2 py-1 rounded-full">
                                      {alt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ayurvedic Notes & Budget Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {aiPlan.nutrition_plan.ayurvedic_notes && aiPlan.nutrition_plan.ayurvedic_notes.length > 0 && (
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <h5 className="text-lg font-semibold text-purple-300">🕉️ Ayurvedic Wisdom</h5>
                        </div>
                        <div className="space-y-2">
                          {aiPlan.nutrition_plan.ayurvedic_notes.map((note, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-purple-200/90 text-sm">{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiPlan.nutrition_plan.budget_tips && aiPlan.nutrition_plan.budget_tips.length > 0 && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <h5 className="text-lg font-semibold text-green-300">💰 Budget Tips</h5>
                        </div>
                        <div className="space-y-2">
                          {aiPlan.nutrition_plan.budget_tips.map((tip, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-green-200/90 text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Supplements */}
              {aiPlan.supplements && aiPlan.supplements.length > 0 && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Supplements</h3>
                      <p className="text-white/60 text-sm">Additional nutritional support</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {aiPlan.supplements.map((supplement: Supplement, i: number) => (
                      <div key={i} className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                          <div>
                            <h5 className="text-lg font-bold text-purple-300">{supplement.name}</h5>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-2 text-sm">
                              <span className="text-white/80">💊 {supplement.dosage}</span>
                              <span className="text-white/80">⏰ {supplement.timing}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-white/70 text-sm mb-4">{supplement.reasoning}</p>
                        
                        {supplement.alternatives && supplement.alternatives.length > 0 && (
                          <div>
                            <span className="text-yellow-300 text-sm font-medium">Natural Alternatives: </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {supplement.alternatives.map((alt, j) => (
                                <span key={j} className="bg-yellow-500/20 text-yellow-200 text-xs px-2 py-1 rounded-full">
                                  {alt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Recommendations */}
              {aiPlan.lifestyle_recommendations && aiPlan.lifestyle_recommendations.length > 0 && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl">
                      <Heart className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Lifestyle Recommendations</h3>
                      <p className="text-white/60 text-sm">Holistic wellness advice</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {aiPlan.lifestyle_recommendations.map((rec: LifestyleRecommendation, i: number) => (
                      <div key={i} className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <h5 className="text-lg font-bold text-cyan-300 capitalize">{rec.category}</h5>
                        </div>
                        
                        <div className="grid gap-3 mb-4">
                          {rec.recommendations.map((recommendation, j) => (
                            <div key={j} className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <span className="text-white/90 text-sm">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                          <span className="text-cyan-300 text-sm font-medium">💡 Why Important: </span>
                          <span className="text-cyan-200/80 text-sm">{rec.reasoning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progression & Precautions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progression */}
                {aiPlan.progression && (
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Progression Plan</h3>
                        <p className="text-white/60 text-sm">How to advance your fitness</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                      <p className="text-white/90 leading-relaxed">{aiPlan.progression}</p>
                    </div>
                  </div>
                )}

                {/* Precautions */}
                {aiPlan.precautions && aiPlan.precautions.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl">
                        <Shield className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Safety Precautions</h3>
                        <p className="text-white/60 text-sm">Important safety guidelines</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6">
                      <div className="space-y-3">
                        {aiPlan.precautions.map((precaution, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-red-200/90 text-sm leading-relaxed">{precaution}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Alternatives Summary */}
              {aiPlan.alternatives_summary && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Alternative Options</h3>
                      <p className="text-white/60 text-sm">Flexible alternatives for your plan</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-6">
                    <p className="text-white/90 leading-relaxed">{aiPlan.alternatives_summary}</p>
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Ready to Transform Your Life?</h3>
                  <p className="text-white/70 max-w-2xl mx-auto">
                    Your personalized plan is ready! {planSource === 'fallback' ? 'This expert-designed plan is safe and effective.' : ''} Remember to consult with healthcare professionals before starting any new fitness or nutrition program.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-6 py-3"
                    >
                      Create Another Plan
                    </Button>

                    <Button 
                      onClick={downloadPDF}
                      disabled={isDownloading}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-6 py-3"
                    >
                      {isDownloading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="animate-spin w-4 h-4" />
                          <span>Generating PDF...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </div>
                      )}
                    </Button>

                    <div className="flex items-center space-x-2 text-white/60 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Plans remaining today: {10 - dailyUsage}</span>
                    </div>
                  </div>
                  
                  {planSource === 'fallback' && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-center justify-center space-x-2 text-amber-200">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">This is a reliable backup plan. You can try generating again later for AI-powered recommendations.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}