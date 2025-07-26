"use client"

import React from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Info, Phone, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { FaPhone, FaMapMarkerAlt, FaInfoCircle, FaArrowLeft } from "react-icons/fa"

interface Trainer {
  _id: string
  name: string
  specialization: string
  contact: string
}

export default function PricingDetailsPage() {
  const [trainers, setTrainers] = React.useState<Trainer[]>([])

  React.useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/trainers')
      if (response.ok) {
        const data = await response.json()
        // Handle the API response structure: { trainers: [...] }
        const trainersArray = data.trainers || data || []
        setTrainers(Array.isArray(trainersArray) ? trainersArray.slice(0, 2) : []) // Show first 2 trainers
      } else {
        // Fallback to mock data if API fails
        console.log('API failed, using mock data')
        setTrainers(getMockTrainers().slice(0, 2))
      }
    } catch (error) {
      console.error('Error fetching trainers:', error)
      // Fallback to mock data if API fails
      setTrainers(getMockTrainers().slice(0, 2))
    }
  }

  // Mock data for fallback
  const getMockTrainers = (): Trainer[] => [
    {
      _id: "1",
      name: "Rajesh Kumar",
      specialization: "Weight Training & Bodybuilding",
      contact: "9876543210"
    },
    {
      _id: "2",
      name: "Priya Patel",
      specialization: "Yoga & Wellness",
      contact: "9876543211"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold premium-text-gradient mb-6">
            Membership Plans
          </h1>
          <div className="w-24 h-1 premium-gradient rounded-full mx-auto mb-8"></div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your fitness journey
          </p>
        </div>

        {/* Payment Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-red-900/20 border-red-500/30 mb-12">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <FaInfoCircle className="w-5 h-5 mr-2 text-red-400" />
                Important Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-900/30 p-6 rounded-lg border border-red-500/30">
                <h3 className="text-xl font-bold text-red-400 mb-4">हिंदी में / In Hindi:</h3>
                <p className="text-lg text-red-300 leading-relaxed">
                  हम फिलहाल ऑनलाइन पेमेंट स्वीकार नहीं कर रहे हैं।
                </p>
              </div>
              
              <div className="bg-red-900/30 p-6 rounded-lg border border-red-500/30">
                <h3 className="text-xl font-bold text-red-400 mb-4">In English:</h3>
                <p className="text-lg text-red-300 leading-relaxed">
                  Currently, we are not accepting online payments.
                </p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                <h3 className="text-xl font-bold text-white mb-4">Information Only</h3>
                <p className="text-gray-300 leading-relaxed">
                  This section is meant only to provide information about our membership plans and pricing structure.
                </p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
                <p className="text-gray-300 leading-relaxed">
                  Please contact the owner or visit the gym for payment and further inquiry. Free trial valid for one day only.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gray-800 border-gray-700 mb-12">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FaPhone className="w-5 h-5 mr-2 text-blue-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Primary Contact</p>
                  <p className="text-xl font-bold text-blue-400">09034095999</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Secondary Contact</p>
                  <p className="text-xl font-bold text-blue-400">9034884777</p>
                </div>
                <div className="flex items-center mt-4">
                  <FaMapMarkerAlt className="w-5 h-5 mr-2 text-green-400" />
                  <span className="text-gray-300">Kirpal Nagar, Rohtak, Haryana 124001</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trainer Information */}
        {trainers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700 mb-12">
              <CardHeader>
                <CardTitle className="text-white">Available Trainers</CardTitle>
                <p className="text-gray-300">Contact any of our trainers for personalized guidance</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {trainers.map((trainer) => (
                    <Card key={trainer._id} className="bg-gray-700 border-gray-600 hover:border-blue-400 transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-white">{trainer.name}</CardTitle>
                        <p className="text-blue-400 font-medium">{trainer.specialization}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-3">
                          Expert trainer with years of experience in {trainer.specialization.toLowerCase()}
                        </p>
                        <div className="flex items-center">
                          <FaPhone className="w-4 h-4 mr-2 text-green-400" />
                          <span className="text-white font-medium">{trainer.contact}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-gray-800/20 to-blue-900/20 border-gray-300/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Your Fitness Journey?
              </h3>
              <p className="text-gray-300 mb-6">
                Visit our gym today and take the first step towards a healthier, stronger you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:09034095999">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <FaPhone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </a>
                <Link href="/trainers">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View All Trainers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 