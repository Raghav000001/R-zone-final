import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Heart } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 yoga-gradient opacity-95" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 animate-pulse">
        <Sparkles className="h-12 w-12 text-white/20" />
      </div>
      <div className="absolute bottom-16 right-16 animate-bounce">
        <Heart className="h-8 w-8 text-white/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Life?</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of students who have discovered inner peace, physical strength, and holistic wellness through
            our unique approach to yoga and mindfulness.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/ai-planner">
              <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                🧠 Start Your AI Wellness Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🕉️</div>
              <div className="font-semibold">Ancient Wisdom</div>
              <div className="text-white/80 text-sm">Traditional yoga practices</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🤖</div>
              <div className="font-semibold">Modern Technology</div>
              <div className="text-white/80 text-sm">AI-powered personalization</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🌟</div>
              <div className="font-semibold">Holistic Approach</div>
              <div className="text-white/80 text-sm">Mind, body, and spirit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
