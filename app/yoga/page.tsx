"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook } from "react-icons/fa"

export default function YogaPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/yogahero3.jpg"
          alt="Yoga Hero"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <motion.div 
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl sm:text-2xl  font-bold text-white mb-6">
            Yogacharya Kartik
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            The Spirit of Inner Strength
          </p>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Transforming lives through the power of traditional yoga
          </p>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/aboutyoga.jpg"
                  alt="Yogacharya Kartik"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                About Yogacharya Kartik
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-8"></div>
              
              {/* Desktop version - multiple paragraphs */}
              <div className="hidden md:block space-y-4">
                <p className="text-lg leading-relaxed text-gray-300">
                  Yogacharya Kartik is a renowned yoga practitioner and spiritual guide with over 15 years of experience in traditional yoga practices. His journey began in the sacred ashrams of Rishikesh, where he immersed himself in the ancient wisdom of yoga under the guidance of revered masters.
                </p>
                <p className="text-lg leading-relaxed text-gray-300">
                  Through his unique blend of traditional Hatha yoga, meditation techniques, and modern wellness approaches, Kartik has helped thousands of individuals discover their inner strength and achieve physical, mental, and spiritual balance. His teaching philosophy emphasizes the connection between mind, body, and soul.
                </p>
                <p className="text-lg leading-relaxed text-gray-300">
                  At R-Zone Fitness Gym, Kartik leads specialized yoga sessions that combine traditional practices with contemporary fitness principles, creating a holistic approach to wellness that resonates with people of all ages and fitness levels.
                </p>
              </div>
              
              {/* Mobile version - single paragraph */}
              <div className="md:hidden">
                <p className="text-lg leading-relaxed text-gray-300">
                  Yogacharya Kartik is a renowned yoga practitioner with over 15 years of experience in traditional yoga practices. Through his unique blend of traditional Hatha yoga, meditation techniques, and modern wellness approaches, he has helped thousands discover their inner strength and achieve physical, mental, and spiritual balance. At R-Zone Fitness Gym, Kartik leads specialized yoga sessions that combine traditional practices with contemporary fitness principles.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Photo Gallery
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Capturing moments of transformation and spiritual growth
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <motion.div
                key={num}
                className="relative aspect-square rounded-xl overflow-hidden group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: num * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src={`/yoga${num}.jpg`}
                  alt={`Yoga practice ${num}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Begin Your Yoga Journey?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-gray-300 mb-8">
              Reach out to schedule a session with Yogacharya Kartik
            </p>
            
            <motion.div 
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 rounded-full text-white font-semibold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPhone className="w-5 h-5" />
              <span>Contact: 9034884777</span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 