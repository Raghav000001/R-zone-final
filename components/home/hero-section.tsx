import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell, Heart, Trophy } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 fitness-text-gradient opacity-90" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/hero.jpg')`,
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <Dumbbell className="h-8 w-8 text-white/30" />
      </div>
      <div className="absolute bottom-32 right-16 animate-pulse">
        <Heart className="h-6 w-6 text-white/20" />
      </div>
      <div className="absolute top-1/3 right-20 animate-bounce delay-1000">
        <Trophy className="h-10 w-10 text-white/25" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-[60vh] px-4 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
            🏋️‍♀️ Ultima Fitness Gym - Authentic Fitness Experience
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Transform Your Life at
          <span className="block text-yellow-300">Ultima Fitness Gym</span>
        </h1>

        <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
          Experience the perfect blend of modern fitness, personalized AI wellness plans, and holistic healing. Begin
          your journey to inner peace and physical vitality.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/ai-planner">
            <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              🧠 Get AI Wellness Plan
            </Button>
          </Link>
          <Link href="/astrology">
            <Button size="lg" className="bg-yellow-300 text-blue-900 hover:bg-yellow-400 px-8 py-3 text-lg font-semibold">
              🌠 Explore Astrology
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-white/80">Happy Students</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">10+</div>
            <div className="text-white/80">Expert Trainers</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">5+</div>
            <div className="text-white/80">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
  )
}
