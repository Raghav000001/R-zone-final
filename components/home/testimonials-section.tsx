import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Anita Desai",
      role: "Software Engineer",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The AI wellness plan completely transformed my approach to health. The personalized yoga routines and diet suggestions fit perfectly into my busy schedule. I feel more energetic and peaceful than ever before.",
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,

    },
    {
      name: "Meera Patel",
      role: "Teacher",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "After struggling with stress and anxiety, I found peace here. The trainers are incredibly knowledgeable, and the holistic approach addresses both physical and mental well-being. Highly recommended!",
    },
    {
      name: "Vikram Singh",
      role: "Doctor",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "As a medical professional, I appreciate the scientific approach combined with ancient wisdom. The AI-generated wellness plans are remarkably accurate and effective. This is the future of wellness.",
    },
    {
      name: "Priya Sharma",
      role: "Marketing Manager",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The flexibility of online and offline classes is perfect for my lifestyle. The community here is supportive, and I've made lasting friendships. My yoga journey has been truly transformative.",
    },
    {
      name: "Amit Gupta",
      role: "Entrepreneur",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The personalized attention and expert guidance helped me overcome chronic back pain. The meditation sessions have improved my focus and decision-making abilities significantly.",
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 fitness-text-gradient">What Our Members Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real stories from real people who have transformed their lives through our holistic wellness approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-green-500 opacity-50" />
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-full">
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-bold text-lg">4.9/5</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300">Average rating from 500+ students</div>
          </div>
        </div>
      </div>
    </section>
  )
}
