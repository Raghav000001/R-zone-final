"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Award, Users, Calendar, Clock, Globe, CheckCircle, MessageCircle, Phone, ArrowLeft } from "lucide-react"

interface Trainer {
  _id: string
  name: string
  specialization: string
  experience: number
  photo: string
  contact: string
  bio?: string
  rating?: number
  students?: number
  certifications?: string[]
  languages?: string[]
  availability?: string
  specialties?: string[]
  achievements?: string[]
  testimonials?: Array<{
    name: string
    text: string
    rating: number
  }>
  classTypes?: Array<{
    name: string
    duration: string
    price: string
    description: string
  }>
}

export default function TrainerProfile({ params }: { params: { slug: string } }) {
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTrainer()
  }, [params.slug])

  const fetchTrainer = async () => {
    try {
      const response = await fetch(`/api/trainers/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        // Handle the API response structure: { trainer: {...} } or direct trainer object
        const trainerData = data.trainer || data
        setTrainer(trainerData)
      } else if (response.status === 404) {
        notFound()
      } else {
        // Fallback to mock data if API fails
        console.log('API failed, using mock data')
        setTrainer(getMockTrainer(params.slug))
      }
    } catch (error) {
      console.error('Error fetching trainer:', error)
      // Fallback to mock data if API fails
      setTrainer(getMockTrainer(params.slug))
    } finally {
      setLoading(false)
    }
  }

  // Mock data for fallback
  const getMockTrainer = (id: string): Trainer => {
    const mockTrainers = {
      "1": {
        _id: "1",
        name: "Rajesh Kumar",
        specialization: "Weight Training & Bodybuilding",
        experience: 8,
        photo: "/placeholder-user.jpg",
        contact: "9876543210",
        bio: "Certified personal trainer with 8 years of experience in weight training and bodybuilding. Specializes in muscle building and strength training programs.",
        rating: 4.8,
        students: 150,
        certifications: ["ACE Personal Trainer", "NASM Certified", "Bodybuilding Specialist"],
        languages: ["English", "Hindi", "Punjabi"],
        availability: "Mon-Sat: 6AM-10PM",
        specialties: ["Muscle Building", "Strength Training", "Bodybuilding", "Powerlifting"],
        achievements: [
          "Trained 150+ clients successfully",
          "Former state-level bodybuilding champion",
          "Certified by ACE and NASM",
          "Featured in fitness magazines"
        ],
        testimonials: [
          {
            name: "Amit Singh",
            text: "Rajesh helped me gain 15kg of muscle in just 6 months. His knowledge is incredible!",
            rating: 5
          },
          {
            name: "Priya Sharma",
            text: "Best trainer I've ever worked with. Very patient and knowledgeable.",
            rating: 5
          }
        ],
        classTypes: [
          {
            name: "Personal Training",
            duration: "60 minutes",
            price: "₹2000",
            description: "One-on-one personalized training session"
          },
          {
            name: "Group Training",
            duration: "45 minutes",
            price: "₹800",
            description: "Small group training session"
          }
        ]
      },
      "2": {
        _id: "2",
        name: "Priya Patel",
        specialization: "Yoga & Wellness",
        experience: 6,
        photo: "/placeholder-user.jpg",
        contact: "9876543211",
        bio: "Certified yoga instructor with expertise in Hatha, Ashtanga, and therapeutic yoga. Helps clients achieve mental and physical wellness.",
        rating: 4.9,
        students: 120,
        certifications: ["RYT-500", "Yoga Alliance Certified", "Therapeutic Yoga Specialist"],
        languages: ["English", "Hindi", "Gujarati"],
        availability: "Mon-Sun: 6AM-8PM",
        specialties: ["Hatha Yoga", "Ashtanga Yoga", "Therapeutic Yoga", "Meditation"],
        achievements: [
          "RYT-500 certified instructor",
          "Trained 120+ yoga students",
          "Specialized in therapeutic yoga",
          "Conducted workshops in 5+ cities"
        ],
        testimonials: [
          {
            name: "Sarah Johnson",
            text: "Priya's yoga classes are transformative. I feel so much better mentally and physically.",
            rating: 5
          },
          {
            name: "Ravi Kumar",
            text: "Her therapeutic yoga helped me recover from back pain. Highly recommended!",
            rating: 5
          }
        ],
        classTypes: [
          {
            name: "Hatha Yoga",
            duration: "60 minutes",
            price: "₹600",
            description: "Traditional Hatha yoga for beginners and intermediates"
          },
          {
            name: "Therapeutic Yoga",
            duration: "75 minutes",
            price: "₹800",
            description: "Specialized yoga for pain relief and healing"
          }
        ]
      },
      "3": {
        _id: "3",
        name: "Amit Sharma",
        specialization: "Cardio & HIIT Training",
        experience: 5,
        photo: "/placeholder-user.jpg",
        contact: "9876543212",
        bio: "Specialized in cardiovascular fitness and high-intensity interval training. Helps clients improve endurance and burn fat effectively.",
        rating: 4.7,
        students: 80,
        certifications: ["ACE Personal Trainer", "HIIT Specialist", "Cardio Fitness Expert"],
        languages: ["English", "Hindi"],
        availability: "Mon-Sat: 5AM-9PM",
        specialties: ["HIIT Training", "Cardio Fitness", "Fat Loss", "Endurance Training"],
        achievements: [
          "ACE certified personal trainer",
          "HIIT training specialist",
          "Helped 80+ clients achieve fat loss goals",
          "Former marathon runner"
        ],
        testimonials: [
          {
            name: "Neha Gupta",
            text: "Amit's HIIT sessions are intense but effective. I lost 10kg in 3 months!",
            rating: 5
          },
          {
            name: "Karan Singh",
            text: "Great cardio trainer. His endurance programs are excellent.",
            rating: 4
          }
        ],
        classTypes: [
          {
            name: "HIIT Training",
            duration: "30 minutes",
            price: "₹500",
            description: "High-intensity interval training for fat burning"
          },
          {
            name: "Cardio Session",
            duration: "45 minutes",
            price: "₹400",
            description: "Cardiovascular fitness training"
          }
        ]
      }
    }
    
    return mockTrainers[id as keyof typeof mockTrainers] || mockTrainers["1"]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading trainer profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-400">{error || "Trainer not found"}</p>
            <Link href="/trainers">
              <Button className="mt-4">
                Back to Trainers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/trainers">
              <Button variant="ghost" className="text-white hover:text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Trainers
              </Button>
            </Link>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Trainer Image */}
            <div className="lg:col-span-1">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden">
                <Image
                  src={trainer.photo || "/placeholder-user.jpg"}
                  alt={trainer.name}
                  fill
                  className="object-cover"
                />
                {trainer.rating && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{trainer.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trainer Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold premium-text-gradient mb-4">
                  {trainer.name}
                </h1>
                <p className="text-xl text-gray-300 font-medium mb-4">{trainer.specialization}</p>
                <div className="flex flex-wrap gap-4 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-gray-300" />
                    <span>{trainer.experience} Years Experience</span>
                  </div>
                  {trainer.students && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-300" />
                      <span>{trainer.students} Students</span>
                    </div>
                  )}
                  {trainer.certifications && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-gray-300" />
                      <span>{trainer.certifications.length} Certifications</span>
                    </div>
                  )}
                </div>
              </div>

              {trainer.bio && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                  <p className="text-gray-300 leading-relaxed">{trainer.bio}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={`tel:${trainer.contact}`}>
                  <Button className="premium-button">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Trainer
                  </Button>
                </a>
                <Link href="/trainers">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View All Trainers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      {trainer.specialties && trainer.specialties.length > 0 && (
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold premium-text-gradient mb-8 text-center">
              Specialties
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainer.specialties.map((specialty, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gray-300 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      <span className="text-white">{specialty}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications */}
      {trainer.certifications && trainer.certifications.length > 0 && (
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold premium-text-gradient mb-8 text-center">
              Certifications
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {trainer.certifications.map((cert, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      <span className="text-white">{cert}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievements */}
      {trainer.achievements && trainer.achievements.length > 0 && (
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold premium-text-gradient mb-8 text-center">
              Achievements
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {trainer.achievements.map((achievement, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-white">{achievement}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {trainer.testimonials && trainer.testimonials.length > 0 && (
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold premium-text-gradient mb-8 text-center">
              What Students Say
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainer.testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                    <p className="text-white font-medium">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-gray-900/20 to-red-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Train with {trainer.name}?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact {trainer.name} directly to discuss your fitness goals and schedule your first session.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${trainer.contact}`}>
              <Button className="premium-button text-lg px-8 py-4">
                <Phone className="w-4 h-4 mr-2" />
                Call {trainer.name}
              </Button>
            </a>
            <Link href="/trainers">
              <Button variant="outline" className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10">
                View All Trainers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
