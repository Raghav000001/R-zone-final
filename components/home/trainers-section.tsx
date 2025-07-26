"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Award, Users } from "lucide-react"

export default function TrainersSection() {
  const trainers = [
    {
      id: "priya-sharma",
      name: "Priya Sharma",
      specialization: ["Hatha Yoga", "Meditation", "Pranayama"],
      experience: "8 Years",
      rating: 4.9,
      students: 150,
      image: "/placeholder.svg?height=300&width=300",
      bio: "Certified yoga instructor with deep knowledge of traditional Indian practices and modern wellness techniques.",
    },
    {
      id: "arjun-patel",
      name: "Arjun Patel",
      specialization: ["Vinyasa Flow", "Strength Training", "Flexibility"],
      experience: "6 Years",
      rating: 4.8,
      students: 120,
      image: "/placeholder.svg?height=300&width=300",
      bio: "Dynamic instructor specializing in power yoga and strength-building practices for modern lifestyles.",
    },
    {
      id: "maya-singh",
      name: "Maya Singh",
      specialization: ["Restorative Yoga", "Ayurveda", "Wellness Coaching"],
      experience: "10 Years",
      rating: 5.0,
      students: 200,
      image: "/placeholder.svg?height=300&width=300",
      bio: "Holistic wellness expert combining yoga therapy with Ayurvedic principles for complete healing.",
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 fitness-text-gradient">Meet Our Elite Trainers</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn from certified yoga instructors who bring years of experience and deep knowledge of traditional Indian
            wellness practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={trainer.image || "/placeholder.svg"}
                  alt={trainer.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{trainer.rating}</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{trainer.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{trainer.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {trainer.specialization.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>{trainer.experience}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{trainer.students} students</span>
                  </div>
                </div>

                <Link href={`/trainers/${trainer.id}`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/trainers">
            <Button size="lg" className="yoga-gradient text-white hover:opacity-90">
              View All Trainers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
