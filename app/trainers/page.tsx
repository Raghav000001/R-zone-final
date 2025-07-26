"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { FaArrowLeft, FaDumbbell, FaUsers, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTrophy, FaHeart, FaClock, FaGraduationCap } from "react-icons/fa"

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
  testimonials?: string[]
  classTypes?: string[]
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/trainers')
      if (response.ok) {
        const data = await response.json()
        const trainersArray = data.trainers || data || []
        
        if (Array.isArray(trainersArray)) {
          setTrainers(trainersArray)
        } else {
          throw new Error('Invalid data format received')
        }
      } else {
        throw new Error(`Failed to fetch trainers: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching trainers:', error)
      setError('Failed to load trainers. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/trainerbanner.2png.avif"
          alt="Trainers Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-blue-400 transition-colors">
                  <FaArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-blue-400 mb-6">
                Meet Our Expert Trainers
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-8"></div>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Learn from certified fitness trainers who bring years of experience, deep knowledge of fitness practices, 
                and personalized guidance to help you achieve your fitness goals.
              </p>
            </motion.div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div 
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-400 font-medium">Loading our amazing trainers...</p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
                <FaHeart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-400 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={fetchTrainers} className="bg-red-600 hover:bg-red-700">
                  Try Again
                </Button>
        </div>
            </motion.div>
          )}

      {/* Trainers Grid */}
          {!loading && !error && (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {trainers.map((trainer, index) => (
                <motion.div
                  key={trainer._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-blue-400/50 transition-all duration-300 overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={trainer.photo || '/placeholder-user.jpg'}
                    alt={trainer.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Trainer Stats Overlay */}
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                          {trainer.rating && (
                            <div className="bg-yellow-500/90 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center">
                              <FaStar className="w-3 h-3 mr-1" />
                              {trainer.rating}
                            </div>
                          )}
                          {trainer.students && (
                            <div className="bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                              <FaUsers className="w-3 h-3 mr-1" />
                              {trainer.students}+
                            </div>
                          )}
                        </div>

                        {/* Experience Badge */}
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                            <FaClock className="w-3 h-3 mr-1" />
                            {trainer.experience} Years
                  </div>
                  </div>
                </div>
                    </CardHeader>

                <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Trainer Name & Specialization */}
                        <div>
                          <CardTitle className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {trainer.name}
                          </CardTitle>
                          <p className="text-green-400 font-medium flex items-center">
                            <FaDumbbell className="w-4 h-4 mr-2" />
                            {trainer.specialization}
                          </p>
                        </div>

                        {/* Bio */}
                        {trainer.bio && (
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {trainer.bio.length > 120 ? `${trainer.bio.substring(0, 120)}...` : trainer.bio}
                          </p>
                        )}

                        {/* Specialties */}
                        {trainer.specialties && trainer.specialties.length > 0 && (
                          <div>
                            <h4 className="text-purple-400 font-semibold text-sm mb-2 flex items-center">
                              <FaTrophy className="w-3 h-3 mr-1" />
                              Specialties
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {trainer.specialties.slice(0, 3).map((specialty, idx) => (
                                <span key={idx} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications */}
                        {trainer.certifications && trainer.certifications.length > 0 && (
                          <div>
                            <h4 className="text-orange-400 font-semibold text-sm mb-2 flex items-center">
                              <FaGraduationCap className="w-3 h-3 mr-1" />
                              Certifications
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {trainer.certifications.slice(0, 2).map((cert, idx) => (
                                <span key={idx} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Information */}
                        <div className="pt-4 border-t border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <a 
                                href={`tel:${trainer.contact}`}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <FaPhone className="w-4 h-4" />
                              </a>
                              <span className="text-gray-300 text-sm font-medium">
                                {trainer.contact}
                              </span>
                  </div>

                            <Link href={`/trainers/${trainer._id}`}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                View Profile
                              </Button>
                            </Link>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && trainers.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-800/50 rounded-lg p-8 max-w-md mx-auto">
                <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Trainers Available</h3>
                <p className="text-gray-400 mb-4">We're currently updating our trainer profiles. Please check back soon!</p>
                <Button onClick={fetchTrainers} className="bg-blue-600 hover:bg-blue-700">
                  Refresh
                </Button>
          </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">
                Ready to Start Your Fitness Journey?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Choose your perfect trainer and take the first step towards achieving your fitness goals. 
                Our expert trainers are here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
            <Link href="/ai-planner">
                  <Button variant="outline" className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10">
                    <FaDumbbell className="w-4 h-4 mr-2" />
                    Get AI Fitness Plan
              </Button>
            </Link>
              </div>
          </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
