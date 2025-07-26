"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaPlay, FaPause, FaArrowLeft, FaVideo, FaMapMarkedAlt } from "react-icons/fa"
import Link from "next/link"

export default function GymTourPage() {
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({})
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

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

  const gymTourVideos = [
    { id: 'tour1', src: '/tour1.mp4', title: 'Main Gym Area', description: 'State-of-the-art equipment and spacious workout zones' },
    { id: 'tour2', src: '/tour2.mp4', title: 'Cardio Section', description: 'Advanced cardio machines for all fitness levels' },
    { id: 'tour3', src: '/tour3.mp4', title: 'Weight Training', description: 'Comprehensive weight training and strength equipment' },
    { id: 'tour4', src: '/tour4.mp4', title: 'Group Classes', description: 'Dynamic group classes and training sessions' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
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
              className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 px-6 py-3 rounded-full mb-8"
            >
              <FaVideo className="h-5 w-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Virtual Gym Tour</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-blue-400 mb-6">
              Complete Gym Tour
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Take a comprehensive tour of our world-class facilities and discover why R-Zone Fitness Gym 
              is the premier choice for fitness enthusiasts in Rohtak.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gymTourVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-blue-400/50 transition-all duration-300 overflow-hidden">
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
                          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
                        >
                          {playingVideos[video.id] ? (
                            <FaPause className="w-8 h-8 text-white" />
                          ) : (
                            <FaPlay className="w-8 h-8 text-white ml-1" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}