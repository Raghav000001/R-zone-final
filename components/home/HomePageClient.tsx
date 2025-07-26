"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, MapPin, Phone, Instagram, Facebook, Star } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { FaDumbbell, FaHeart, FaUsers, FaTrophy, FaClock, FaPlay, FaPause, FaInstagram, FaFacebook, FaGraduationCap, FaArrowLeft, FaVideo, FaMapMarkedAlt } from "react-icons/fa"

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
  specialties?: string[]
}

export default function HomePageClient() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isRecoveryVideoPlaying, setIsRecoveryVideoPlaying] = useState(false)
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({})
  const recoveryVideoRef = useRef<HTMLVideoElement>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  useEffect(() => {
    fetchTrainers()
  }, [])

  const toggleRecoveryVideo = () => {
    if (recoveryVideoRef.current) {
      if (recoveryVideoRef.current.paused) {
        recoveryVideoRef.current.play()
        setIsRecoveryVideoPlaying(true)
      } else {
        recoveryVideoRef.current.pause()
        setIsRecoveryVideoPlaying(false)
      }
    }
  }

  const toggleVideo = (videoId: string) => {
    const video = videoRefs.current[videoId]
    if (video) {
      if (video.paused) {
        video.play()
        setPlayingVideos(prev => ({ ...prev, [videoId]: true }))
      } else {
        video.pause()
        setPlayingVideos(prev => ({ ...prev, [videoId]: false }))
      }
    }
  }

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/trainers')
      if (response.ok) {
        const data = await response.json()
        const trainersArray = data.trainers || data || []
        setTrainers(Array.isArray(trainersArray) ? trainersArray.slice(0, 3) : [])
      } else {
        console.log('API failed, using mock data')
        setTrainers(getMockTrainers().slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching trainers:', error)
      setTrainers(getMockTrainers().slice(0, 3))
    } finally {
      setLoading(false)
    }
  }

  const getMockTrainers = (): Trainer[] => [
    {
      _id: "1",
      name: "Rajesh Kumar",
      specialization: "Weight Training & Bodybuilding",
      experience: 8,
      photo: "/placeholder-user.jpg",
      contact: "9876543210",
      bio: "Certified personal trainer with 8+ years of experience in bodybuilding and strength training.",
      rating: 4.8,
      students: 150,
      certifications: ["ACE Certified", "NASM Certified", "Bodybuilding Specialist"],
      specialties: ["Strength Training", "Muscle Building", "Powerlifting"]
    },
    {
      _id: "2",
      name: "Priya Patel",
      specialization: "Yoga & Wellness",
      experience: 6,
      photo: "/placeholder-user.jpg",
      contact: "9876543211",
      bio: "Experienced yoga instructor specializing in Vinyasa, Hatha, and meditation techniques.",
      rating: 4.9,
      students: 200,
      certifications: ["RYT-500", "Meditation Teacher", "Wellness Coach"],
      specialties: ["Vinyasa Yoga", "Meditation", "Mindfulness"]
    },
    {
      _id: "3",
      name: "Amit Sharma",
      specialization: "Cardio & HIIT Training",
      experience: 5,
      photo: "/placeholder-user.jpg",
      contact: "9876543212",
      bio: "Dynamic fitness trainer focused on high-intensity workouts and cardiovascular conditioning.",
      rating: 4.7,
      students: 120,
      certifications: ["HIIT Specialist", "Cardio Expert", "Functional Training"],
      specialties: ["HIIT", "Cardio", "Functional Training"]
    }
  ]

  const videoTestimonials = [
    { id: 'review1', src: '/review1.mp4', title: 'Member Testimonial 1' },
    { id: 'review2', src: '/review2.mp4', title: 'Member Testimonial 2' },
    { id: 'review3', src: '/review3.mp4', title: 'Member Testimonial 3' },
    { id: 'review4', src: '/review4.mp4', title: 'Member Testimonial 4' },
  ]

  const gymTourVideos = [
    { id: 'tour1', src: '/tour1.mp4', title: 'Main Gym Area', description: 'State-of-the-art equipment and spacious workout zones' },
    { id: 'tour2', src: '/tour2.mp4', title: 'Cardio Section', description: 'Advanced cardio machines for all fitness levels' },
    { id: 'tour3', src: '/tour3.mp4', title: 'Weight Training', description: 'Comprehensive weight training and strength equipment' },
    { id: 'tour4', src: '/tour4.mp4', title: 'Group Classes', description: 'Dynamic group classes and training sessions' },
  ]

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="/herobanner2.avif"
            alt="R-Zone Fitness Gym Hero"
            fill
            className="object-cover object-center"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
              }
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 px-6 py-3 rounded-full mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FaDumbbell className="h-5 w-5 text-orange-400" />
              <span className="text-orange-300 font-medium">50+ Years of Excellence</span>
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              50+ Years of Fitness Excellence
            </motion.h1>
            <motion.h2 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome to R-Zone Fitness Gym
            </motion.h2>
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Transform your life with our premium facilities, expert trainers, and supportive community. 
              Where legends are made and dreams become reality.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/trainers">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg px-8 py-4 font-bold shadow-lg transition-all duration-300 hover:scale-105">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/pricing-details">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 transition-all duration-300 hover:scale-105">
                  View Plans
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gym Tour Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 px-6 py-3 rounded-full mb-8"
            >
              <FaVideo className="h-5 w-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Virtual Tour</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              Take a Tour of Our Gym
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore our world-class facilities and see why R-Zone Fitness Gym is the premier choice for fitness enthusiasts
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {gymTourVideos.map((video, index) => (
              <motion.div
                key={video.id}
                variants={itemVariants}
                className="group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-blue-400/50 transition-all duration-300 overflow-hidden h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <video
                        ref={(el) => { videoRefs.current[video.id] = el }}
                        src={video.src}
                        className="w-full h-full object-cover"
                        poster="/placeholder.jpg"
                        muted
                        loop
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
                        <button
                          onClick={() => toggleVideo(video.id)}
                          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
                        >
                          {playingVideos[video.id] ? (
                            <FaPause className="w-6 h-6 text-white" />
                          ) : (
                            <FaPlay className="w-6 h-6 text-white ml-1" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/gym-tour">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-10 py-4 font-bold shadow-lg transition-all duration-300 hover:scale-105">
                <FaMapMarkedAlt className="w-5 h-5 mr-2" />
                Full Gym Tour
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative z-10">
                <Image
                  src="/aboutbanner.jpg"
                  alt="R-Zone Fitness Gym Owner"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl -z-10"></div>
            </motion.div>
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                  About R-Zone Fitness Gym
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
              </div>
              <div className="space-y-6 text-base sm:text-lg leading-relaxed text-gray-300">
                <p>
                  For over 50 years, R-Zone Fitness Gym has been the cornerstone of fitness excellence in Rohtak. 
                  Our commitment to transforming lives through fitness has made us the most trusted name in the region.
                </p>
                <p>
                  We believe in providing world-class facilities with a personal touch. Our expert trainers, 
                  state-of-the-art equipment, and supportive community create the perfect environment for your fitness journey.
                </p>
                <p>
                  From beginners to advanced athletes, we cater to all fitness levels with personalized programs 
                  designed to help you achieve your goals and unlock your full potential.
                </p>
              </div>
              <motion.div 
                className="grid grid-cols-3 gap-8 pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">50+</div>
                  <div className="text-gray-400 font-medium text-sm sm:text-base">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">1000+</div>
                  <div className="text-gray-400 font-medium text-sm sm:text-base">Happy Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">10+</div>
                  <div className="text-gray-400 font-medium text-sm sm:text-base">Expert Trainers</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-gray-800 via-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
              Our Achievements
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Decades of excellence in fitness training and community building, creating champions and transforming lives
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-3">1000+</div>
              <div className="text-gray-300 font-medium text-base sm:text-lg">Happy Members</div>
            </motion.div>
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaTrophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-3">50+</div>
              <div className="text-gray-300 font-medium text-base sm:text-lg">Years Experience</div>
            </motion.div>
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaDumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-3">10+</div>
              <div className="text-gray-300 font-medium text-base sm:text-lg">Expert Trainers</div>
            </motion.div>
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaClock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-3">24/7</div>
              <div className="text-gray-300 font-medium text-base sm:text-lg">Support Available</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Active Recovery Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Text Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                  Active Recovery
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
              </div>
              <div className="space-y-6 text-lg leading-relaxed text-gray-300">
                <p className="md:block hidden">
                  Recovery is not just about rest—it's about active restoration. At R-Zone Fitness Gym, 
                  we understand that proper recovery is the foundation of sustainable fitness progress.
                </p>
                <p className="md:block hidden">
                  Our active recovery programs help you maintain mobility, reduce muscle soreness, 
                  and improve overall performance while preventing injuries and burnout.
                </p>
                <p className="md:hidden">
                  Recovery is essential for sustainable fitness progress. Our active recovery programs help you maintain mobility, reduce soreness, and prevent injuries.
                </p>
              </div>
              <div className="space-y-6 md:block hidden">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Enhanced Performance</h3>
                    <p className="text-gray-300">Proper recovery leads to better workout performance and faster progress</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Injury Prevention</h3>
                    <p className="text-gray-300">Active recovery techniques help prevent overuse injuries</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Mental Wellbeing</h3>
                    <p className="text-gray-300">Recovery sessions promote mental clarity and reduce stress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Card */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <video
                      ref={recoveryVideoRef}
                      src="/recovery.mp4"
                      className="w-full h-full object-cover"
                      poster="/placeholder.jpg"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <button
                        onClick={toggleRecoveryVideo}
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
                      >
                        {isRecoveryVideoPlaying ? (
                          <FaPause className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                        ) : (
                          <FaPlay className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-3">Recovery Techniques</h3>
                    <p className="text-gray-300 text-lg mb-6">
                      Learn essential recovery techniques from our expert trainers
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-lg">Duration: 5:30</span>
                      <button
                        onClick={toggleRecoveryVideo}
                        className="text-white hover:text-orange-400 transition-colors text-lg font-medium"
                      >
                        {isRecoveryVideoPlaying ? 'Pause Video' : 'Watch Full Video'}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              Meet Our Expert Trainers
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our certified trainers are here to guide you on your fitness journey with personalized attention and expert knowledge
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-64 bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {trainers.map((trainer, index) => (
                <motion.div
                  key={trainer._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-orange-500/50 transition-all duration-300 group overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={trainer.photo || '/placeholder-user.jpg'}
                          alt={trainer.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(trainer.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white text-sm font-medium">({trainer.rating})</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                        {trainer.name}
                      </CardTitle>
                      <p className="text-orange-400 font-semibold text-lg mb-3">{trainer.specialization}</p>
                      <p className="text-gray-300 mb-4">{trainer.bio}</p>
                      <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                        <span>{trainer.experience} years experience</span>
                        <span>{trainer.students} students</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trainer.certifications?.slice(0, 2).map((cert, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                            {cert}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">{trainer.contact}</span>
                        <Link href={`/trainers/${trainer._id}`}>
                          <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/trainers">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg px-10 py-4 font-bold shadow-lg">
                View All Trainers
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              Choose Your Plan
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Flexible membership options designed to fit your lifestyle and fitness goals
            </p>
          </motion.div>

          {/* Strength Plans */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                💪 Strength Plans
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Perfect for building muscle, increasing strength, and achieving your bodybuilding goals
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  duration: "1 Month",
                  price: "₹1,000",
                  originalPrice: "₹1,200",
                  savings: "Save ₹200",
                  popular: false
                },
                {
                  duration: "3 Months",
                  price: "₹2,700",
                  originalPrice: "₹3,600",
                  savings: "Save ₹900",
                  popular: false
                },
                {
                  duration: "6 Months",
                  price: "₹4,800",
                  originalPrice: "₹7,200",
                  savings: "Save ₹2,400",
                  popular: true
                },
                {
                  duration: "1 Year",
                  price: "₹8,400",
                  originalPrice: "₹14,400",
                  savings: "Save ₹6,000",
                  popular: false
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className={`bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group h-full relative ${
                      plan.popular ? 'ring-2 ring-orange-500/50' : ''
                    }`}
                    onClick={() => window.location.href = '/pricing-details'}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-6 pt-8">
                      <CardTitle className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                        {plan.duration}
                      </CardTitle>
                      <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                      <div className="text-gray-400 text-sm line-through">{plan.originalPrice}</div>
                      <div className="text-orange-400 text-sm font-semibold">{plan.savings}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm">
                          All plans include locker & water access
                        </p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg py-3 font-bold transition-all duration-300 hover:scale-105">
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cardio Plans */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                🏃‍♂️ Cardio Plans
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Ideal for cardiovascular fitness, weight loss, and improving endurance
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  duration: "1 Month",
                  price: "₹1,500",
                  originalPrice: "₹1,800",
                  savings: "Save ₹300",
                  popular: false
                },
                {
                  duration: "3 Months",
                  price: "₹4,000",
                  originalPrice: "₹5,400",
                  savings: "Save ₹1,400",
                  popular: false
                },
                {
                  duration: "6 Months",
                  price: "₹7,500",
                  originalPrice: "₹10,800",
                  savings: "Save ₹3,300",
                  popular: true
                },
                {
                  duration: "1 Year",
                  price: "₹12,000",
                  originalPrice: "₹21,600",
                  savings: "Save ₹9,600",
                  popular: false
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className={`bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group h-full relative ${
                      plan.popular ? 'ring-2 ring-blue-500/50' : ''
                    }`}
                    onClick={() => window.location.href = '/pricing-details'}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-6 pt-8">
                      <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {plan.duration}
                      </CardTitle>
                      <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                      <div className="text-gray-400 text-sm line-through">{plan.originalPrice}</div>
                      <div className="text-blue-400 text-sm font-semibold">{plan.savings}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm">
                          All plans include locker & water access
                        </p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg py-3 font-bold transition-all duration-300 hover:scale-105">
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-4xl mx-auto">
              <h4 className="text-2xl font-bold text-white mb-4">
                What's Included in All Plans?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaDumbbell className="w-6 h-6 text-orange-400" />
                  </div>
                  <h5 className="text-white font-semibold">Equipment Access</h5>
                  <p className="text-gray-400 text-sm">Full access to all gym equipment</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaUsers className="w-6 h-6 text-blue-400" />
                  </div>
                  <h5 className="text-white font-semibold">Expert Guidance</h5>
                  <p className="text-gray-400 text-sm">Support from certified trainers</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaTrophy className="w-6 h-6 text-green-400" />
                  </div>
                  <h5 className="text-white font-semibold">Premium Facilities</h5>
                  <p className="text-gray-400 text-sm">Locker rooms & water access</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              What Our Members Say
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Real stories from real people who transformed their lives at R-Zone Fitness Gym
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {videoTestimonials.map((video, index) => (
              <motion.div 
                key={video.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedVideo(video.src)}
              >
                <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 group-hover:border-orange-500/50 transition-all duration-300">
                  <video
                    src={video.src}
                    className="w-full h-full object-cover"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white text-center mt-4 group-hover:text-orange-400 transition-colors">
                  {video.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transform Section - Redesigned as Card */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 sm:p-8 max-w-4xl w-full backdrop-blur-sm">
              <CardContent className="text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-blue-400 mb-6">
                  Ready to Transform Your Life?
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of members who have already started their fitness journey with us. 
                  Your transformation begins today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/trainers">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 font-bold transition-all duration-300 hover:scale-105">
                      <FaArrowLeft className="w-4 h-4 mr-2" />
                      Start Today
                    </Button>
                  </Link>
                  <Link href="/pricing-details">
                    <Button variant="outline" className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 text-lg px-8 py-4 transition-all duration-300 hover:scale-105">
                      <FaDumbbell className="w-4 h-4 mr-2" />
                      View Plans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-16 right-0 text-white text-5xl hover:text-gray-300 transition-colors"
            >
              ×
            </button>
            <video
              src={selectedVideo}
              controls
              className="rounded-2xl max-h-[80vh] shadow-2xl"
              autoPlay
            />
          </div>
        </motion.div>
      )}
    </div>
  )
} 