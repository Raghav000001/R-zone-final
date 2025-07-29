"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download, Printer, AlertCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WellnessPlan, WellnessFormData } from "@/types/wellness"
import { motion } from "framer-motion"
import { FaDumbbell, FaCrosshairs, FaBolt } from "react-icons/fa"

interface DailyUsage {
  date: string
  count: number
}

export default function AIPlanner() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    lifestyle: "",
    medicalConditions: "",
    dietPreference: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', count: 0 })
  const { toast } = useToast()
  const planRef = useRef<HTMLDivElement>(null)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Not authenticated, redirect to admin login
          window.location.href = '/admin/login';
          return;
        }
        
        const data = await response.json();
        if (data.user.role !== 'super_admin') {
          // Not a super admin, redirect to admin login
          window.location.href = '/admin/login';
          return;
        }
        
        // User is authenticated and is super admin
        setLoading(false);
        checkDailyUsage();
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login';
      }
    };

    checkAuth();
  }, [])

  const checkDailyUsage = () => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('ai_planner_usage')
    
    if (stored) {
      try {
        const usage: DailyUsage = JSON.parse(stored)
        if (usage.date === today) {
          setDailyUsage(usage)
        } else {
          // New day, reset count
          const newUsage = { date: today, count: 0 }
          setDailyUsage(newUsage)
          localStorage.setItem('ai_planner_usage', JSON.stringify(newUsage))
        }
      } catch (error) {
        // Invalid storage data, reset
        const newUsage = { date: today, count: 0 }
        setDailyUsage(newUsage)
        localStorage.setItem('ai_planner_usage', JSON.stringify(newUsage))
      }
    } else {
      // First time usage
      const newUsage = { date: today, count: 0 }
      setDailyUsage(newUsage)
      localStorage.setItem('ai_planner_usage', JSON.stringify(newUsage))
    }
  }

  const updateDailyUsage = () => {
    const today = new Date().toDateString()
    const newUsage = { date: today, count: dailyUsage.count + 1 }
    setDailyUsage(newUsage)
    localStorage.setItem('ai_planner_usage', JSON.stringify(newUsage))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const generateWellnessPlan = async () => {
    // Check daily limit
    if (dailyUsage.count >= 10) {
      toast({
        title: "Daily Limit Reached",
        description: "You have reached your daily limit of 10 fitness plan generations. Please try again tomorrow.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.age || !formData.fitnessGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (name, age, and fitness goal).",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: formData.height ? parseInt(formData.height) : undefined,
          weight: formData.weight ? parseInt(formData.weight) : undefined,
          fitnessGoal: formData.fitnessGoal,
          lifestyle: formData.lifestyle,
          medicalConditions: formData.medicalConditions,
          dietPreference: formData.dietPreference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate Indian fitness plan')
      }

      // Update daily usage count
      updateDailyUsage()

      // Check if we have a valid plan or if parsing failed
      if (data.plan && data.rawContent) {
        // Parsing failed, show the raw content for debugging
        console.log('Raw AI response:', data.rawContent);
        console.log('Parse error:', data.parseError);
        
        // Store raw response for debugging
        setRawResponse(data.rawContent);
        
        // Still set the plan but also show a warning
        setWellnessPlan(data.plan);
        toast({
          title: "Plan Generated (with warnings)",
          description: "Plan was generated but there were parsing issues. Check console for details.",
          variant: "destructive",
        });
      } else if (data.plan) {
        // Successfully parsed plan
        setWellnessPlan(data.plan);
        setRawResponse(null); // Clear any previous raw response
        toast({
          title: "Indian Fitness Plan Generated!",
          description: "Your personalized gym and nutrition plan is ready.",
        });
      } else {
        throw new Error('No plan data received from API');
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate Indian fitness plan'
      setError(errorMessage)
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    if (!planRef.current) return

    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: 0.5,
        filename: 'Indian_Fitness_Plan.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      }
      html2pdf().set(opt).from(planRef.current).save()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const printPlan = () => {
    if (!planRef.current) return
    window.print()
  }

  const remainingRequests = Math.max(0, 10 - dailyUsage.count)

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/ai-wellnessbanner.jpg"
          alt="AI Wellness Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          {/* Header */}
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
                <FaDumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                <span className="text-orange-300 font-medium text-sm sm:text-base">AI-Powered Indian Fitness</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                 Fitness Plan Generator
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                Get a customized Indian gym routine with Push-Pull-Leg splits, FST-7 training, and traditional Indian nutrition plan tailored specifically to your goals, lifestyle, and dietary preferences using DeepSeek AI.
              </p>
              
              {/* Daily Usage Counter */}
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mt-4">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 font-medium text-sm">
                  Daily Requests: {dailyUsage.count}/10 remaining
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 xl:gap-12">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="xl:sticky xl:top-8 xl:h-fit order-2 xl:order-1"
            >
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-2xl">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-xl sm:text-2xl">
                    <FaCrosshairs className="h-5 w-5 sm:h-7 sm:w-7 text-orange-400" />
                    <span className="text-white">Tell Us About Yourself</span>
                  </CardTitle>
                  {remainingRequests <= 3 && (
                    <div className="flex items-center space-x-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-yellow-300 text-sm">
                        {remainingRequests === 0 
                          ? "Daily limit reached. Try again tomorrow." 
                          : `Only ${remainingRequests} requests remaining today.`}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white font-medium text-sm sm:text-base">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-white font-medium text-sm sm:text-base">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Enter your age"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium text-sm sm:text-base">Gender *</Label>
                      <Select onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-orange-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="male" className="text-white hover:bg-gray-700">Male</SelectItem>
                          <SelectItem value="female" className="text-white hover:bg-gray-700">Female</SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-white font-medium text-sm sm:text-base">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="Enter weight"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-white font-medium text-sm sm:text-base">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="Enter height"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium text-sm sm:text-base">Fitness Goals *</Label>
                      <Select onValueChange={(value) => handleInputChange('fitnessGoal', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-orange-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="muscle-building" className="text-white hover:bg-gray-700">Muscle Building</SelectItem>
                          <SelectItem value="strength" className="text-white hover:bg-gray-700">Strength Training</SelectItem>
                          <SelectItem value="weight-loss" className="text-white hover:bg-gray-700">Fat Loss</SelectItem>
                          <SelectItem value="general-fitness" className="text-white hover:bg-gray-700">General Fitness</SelectItem>
                          <SelectItem value="athletic-performance" className="text-white hover:bg-gray-700">Athletic Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white font-medium text-sm sm:text-base">Lifestyle</Label>
                      <Select onValueChange={(value) => handleInputChange('lifestyle', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-orange-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select your lifestyle" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="sedentary" className="text-white hover:bg-gray-700">Sedentary (Desk job, minimal activity)</SelectItem>
                          <SelectItem value="moderate" className="text-white hover:bg-gray-700">Moderate (Some exercise, active lifestyle)</SelectItem>
                          <SelectItem value="active" className="text-white hover:bg-gray-700">Active (Regular exercise, physical job)</SelectItem>
                          <SelectItem value="athlete" className="text-white hover:bg-gray-700">Athlete (High-level training)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium text-sm sm:text-base">Diet Preference</Label>
                      <Select onValueChange={(value) => handleInputChange('dietPreference', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-orange-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select your diet preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Vegetarian" className="text-white hover:bg-gray-700">Vegetarian</SelectItem>
                          <SelectItem value="Non-Vegetarian" className="text-white hover:bg-gray-700">Non-Vegetarian</SelectItem>
                          <SelectItem value="Flexible" className="text-white hover:bg-gray-700">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalConditions" className="text-white font-medium text-sm sm:text-base">Medical Conditions (Optional)</Label>
                      <Textarea
                        id="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                        placeholder="Any medical conditions or injuries we should know about?"
                        rows={3}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 resize-none text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateWellnessPlan}
                    disabled={isGenerating || remainingRequests === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-base sm:text-lg py-4 sm:py-6 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Generating Your Plan...
                      </>
                    ) : remainingRequests === 0 ? (
                      <>
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Daily Limit Reached
                      </>
                    ) : (
                      <>
                        <FaBolt className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Generate My Fitness Plan ({remainingRequests} left)
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="flex items-center space-x-2 p-3 sm:p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                      <span className="text-red-300 text-sm sm:text-base">{error}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Display Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6 order-1 xl:order-2"
            >
              {wellnessPlan && (
                <div ref={planRef} className="print-container">
                  <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-2xl print-card">
                    <CardHeader className="print-header">
                      <CardTitle className="text-xl sm:text-2xl font-bold flex items-center text-white">
                        <FaDumbbell className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-orange-400" />
                        Your Indian Fitness Plan
                      </CardTitle>
                      <p className="text-gray-300 text-sm sm:text-base">Generated for {formData.name}</p>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {/* Push Day */}
                      <div className="print-section">
                        <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Push Day Workout</h3>
                        <div className="space-y-2">
                          {wellnessPlan.push_day.exercises.map((exercise, index) => (
                            <div key={index} className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                              <p className="font-medium text-white text-sm sm:text-base">{exercise.name}</p>
                              <p className="text-gray-300 text-xs sm:text-sm">Sets: {exercise.sets}</p>
                              <p className="text-gray-300 text-xs sm:text-sm">Rest: {exercise.rest}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pdf-pagebreak" />
                      {/* Pull Day */}
                      <div className="print-section">
                        <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Pull Day Workout</h3>
                        <div className="space-y-2">
                          {wellnessPlan.pull_day.exercises.map((exercise, index) => (
                            <div key={index} className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                              <p className="font-medium text-white text-sm sm:text-base">{exercise.name}</p>
                              <p className="text-gray-300 text-xs sm:text-sm">Sets: {exercise.sets}</p>
                              <p className="text-gray-300 text-xs sm:text-sm">Rest: {exercise.rest}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pdf-pagebreak" />
                      {/* Legs Day */}
                      <div className="print-section">
                        <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Legs Day Workout</h3>
                        <div className="space-y-2">
                          {wellnessPlan.legs_day.exercises.map((exercise, index) => (
                            <div key={index} className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                              <p className="font-medium text-white text-sm sm:text-base">{exercise.name}</p>
                              <p className="text-gray-300 text-xs sm:text-sm">Sets: {exercise.sets}</p>
                              <p className="text-gray-300 text-xs sm:text-sm">Rest: {exercise.rest}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cardio & HIIT */}
                      {wellnessPlan.cardio_HIIT && (
                        <div className="print-section">
                          <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Cardio & HIIT Training</h3>
                          <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                            <p className="mb-2 text-white text-sm sm:text-base">Weekly Frequency: {wellnessPlan.cardio_HIIT.weekly_frequency || "3x/week"}</p>
                            <div className="space-y-1">
                              {wellnessPlan.cardio_HIIT.routine && wellnessPlan.cardio_HIIT.routine.map((exercise, index) => (
                                <p key={index} className="text-gray-300 text-xs sm:text-sm">• {exercise}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FST-7 Training */}
                      {wellnessPlan.fst7_day && (
                        <div className="print-section">
                          <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">FST-7 Training</h3>
                          <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                            <p className="mb-2 text-white text-sm sm:text-base">Target Muscle: {wellnessPlan.fst7_day.target_muscle || "Chest or Biceps"}</p>
                            <div className="space-y-1">
                              {wellnessPlan.fst7_day.routine && wellnessPlan.fst7_day.routine.map((exercise, index) => (
                                <p key={index} className="text-gray-300 text-xs sm:text-sm">• {exercise}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Diet Plan */}
                      <div className="print-section">
                        <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Ayurvedic Indian Diet Plan ({wellnessPlan.diet_plan.type})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 print-diet-grid">
                          {/* Morning Routine */}
                          {wellnessPlan.diet_plan.morning_routine && (
                            <div>
                              <h4 className="font-bold mb-2 text-white text-sm sm:text-base">🌅 Morning Routine</h4>
                              <ul className="space-y-1 print-yoga-list">
                                {wellnessPlan.diet_plan.morning_routine.map((item, index) => (
                                  <li key={index} className="text-gray-300 text-xs sm:text-sm">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold mb-2 text-white text-sm sm:text-base">🍳 Breakfast</h4>
                            <ul className="space-y-1 print-yoga-list">
                              {wellnessPlan.diet_plan.breakfast.map((item, index) => (
                                <li key={index} className="text-gray-300 text-xs sm:text-sm">• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold mb-2 text-white text-sm sm:text-base">🍽️ Lunch</h4>
                            <ul className="space-y-1 print-yoga-list">
                              {wellnessPlan.diet_plan.lunch.map((item, index) => (
                                <li key={index} className="text-gray-300 text-xs sm:text-sm">• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold mb-2 text-white text-sm sm:text-base">🥜 Snacks</h4>
                            <ul className="space-y-1 print-yoga-list">
                              {wellnessPlan.diet_plan.snacks.map((item, index) => (
                                <li key={index} className="text-gray-300 text-xs sm:text-sm">• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold mb-2 text-white text-sm sm:text-base">🌙 Dinner</h4>
                            <ul className="space-y-1 print-yoga-list">
                              {wellnessPlan.diet_plan.dinner.map((item, index) => (
                                <li key={index} className="text-gray-300 text-xs sm:text-sm">• {item}</li>
                              ))}
                            </ul>
                          </div>
                          {/* Bedtime Routine */}
                          {wellnessPlan.diet_plan.bedtime_routine && (
                            <div>
                              <h4 className="font-bold mb-2 text-white text-sm sm:text-base">🌙 Bedtime Routine</h4>
                              <ul className="space-y-1 print-yoga-list">
                                {wellnessPlan.diet_plan.bedtime_routine.map((item, index) => (
                                  <li key={index} className="text-gray-300 text-xs sm:text-sm">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Supplements */}
                      {wellnessPlan.supplements && wellnessPlan.supplements.length > 0 && (
                        <div className="print-section">
                          <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Recommended Supplements</h3>
                          <ul className="space-y-1 print-recommendations">
                            {wellnessPlan.supplements.map((supplement, index) => (
                              <li key={index} className="text-gray-300 text-xs sm:text-sm">• {supplement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Additional Recommendations */}
                      {wellnessPlan.additional_recommendations && wellnessPlan.additional_recommendations.length > 0 && (
                        <div className="print-section">
                          <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3">Additional Recommendations</h3>
                          <ul className="space-y-1 print-recommendations">
                            {wellnessPlan.additional_recommendations.map((recommendation, index) => (
                              <li key={index} className="text-gray-300 text-xs sm:text-sm">• {recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 no-print">
                    <Button onClick={downloadPDF} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-sm sm:text-base">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={printPlan} variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm sm:text-base">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Plan
                    </Button>
                  </div>

                  {/* Debug Section - Show raw response when parsing fails */}
                  {rawResponse && (
                    <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h4 className="text-red-400 font-semibold mb-2">Debug: Raw AI Response</h4>
                      <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
                        {rawResponse}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {!wellnessPlan && !isGenerating && (
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-2xl">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <FaBolt className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Ready to Get Started?</h3>
                    <p className="text-gray-300 text-base sm:text-lg max-w-md mx-auto">
                      Fill out your fitness profile and get your personalized Indian fitness plan in seconds.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}