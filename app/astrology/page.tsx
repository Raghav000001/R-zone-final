"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FaStar, 
  FaPhone, 
  FaWhatsapp, 
  FaCrown, 
  FaHeart, 
  FaEye, 
  FaBrain, 
  FaPrayingHands,
  FaGem,
  FaHandHoldingHeart,
  FaOm,
  FaUser,
  FaUsers,
  FaLightbulb,
  FaMagic,
  FaPeace
} from "react-icons/fa";
import { 
  Star, 
  MessageCircle, 
  Clock, 
  Users, 
  Award,
  Sparkles,
  Zap,
  Target
} from "lucide-react";

export default function AstrologyPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const services = [
    {
      icon: <FaCrown className="w-8 h-8" />,
      title: "कुंडली विश्लेषण",
      subtitle: "Kundli Analysis",
      description: "Complete birth chart analysis with planetary positions and life predictions",
      features: ["Birth chart creation", "Planetary analysis", "Life predictions", "Career guidance"],
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <FaEye className="w-8 h-8" />,
      title: "चेहरा पढ़ना",
      subtitle: "Face Reading",
      description: "Ancient art of Samudrik Shastra to read personality through facial features",
      features: ["Personality analysis", "Character traits", "Future predictions", "Life path guidance"],
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: <FaBrain className="w-8 h-8" />,
      title: "चिंता और तनाव",
      subtitle: "Anxiety & Stress",
      description: "Spiritual healing for mental peace and emotional balance",
      features: ["Stress relief", "Mental peace", "Emotional healing", "Inner calm"],
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: "प्रेम और रिश्ते",
      subtitle: "Love & Relationships",
      description: "Compatibility analysis and relationship guidance for harmony",
      features: ["Compatibility check", "Relationship advice", "Marriage timing", "Harmony tips"],
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <FaGem className="w-8 h-8" />,
      title: "भाग्योदय",
      subtitle: "Destiny Uplift",
      description: "Transform your destiny through spiritual practices and remedies",
      features: ["Destiny analysis", "Remedies", "Gemstone guidance", "Spiritual practices"],
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <FaPrayingHands className="w-8 h-8" />,
      title: "आध्यात्मिक उपचार",
      subtitle: "Spiritual Healing",
      description: "Deep spiritual healing for mind, body, and soul alignment",
      features: ["Energy healing", "Chakra balancing", "Meditation guidance", "Soul alignment"],
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const testimonials = [
    {
      name: "राहुल शर्मा",
      englishName: "Rahul Sharma",
      text: "कुंडली विश्लेषण से मेरी जिंदगी बदल गई। अब मुझे अपना रास्ता स्पष्ट दिखाई देता है।",
      englishText: "Kundli analysis changed my life. Now I can see my path clearly.",
      rating: 5,
      location: "Mumbai"
    },
    {
      name: "प्रिया पटेल",
      englishName: "Priya Patel",
      text: "चेहरा पढ़ने से मेरे व्यक्तित्व के बारे में बहुत कुछ जानने को मिला।",
      englishText: "Face reading helped me understand so much about my personality.",
      rating: 5,
      location: "Delhi"
    },
    {
      name: "अमित कुमार",
      englishName: "Amit Kumar",
      text: "तनाव से मुक्ति पाने में आध्यात्मिक उपचार ने बहुत मदद की।",
      englishText: "Spiritual healing helped me get rid of stress completely.",
      rating: 5,
      location: "Bangalore"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[80vh]">
            {/* Left Side - Image */}
            <motion.div 
              className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="/astrologybanner.jpg" 
                alt="Astrology Banner" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </motion.div>
            
            {/* Right Side - Content */}
            <div className="text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 px-6 py-3 rounded-full mb-8">
                  <span className="text-yellow-300 font-medium">🔮 Ancient Wisdom • Modern Solutions</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Nitin Ahuja
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Nityanand
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="w-32 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mx-auto lg:mx-0 mb-8"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  ज्योतिष और आध्यात्मिक उपचार
                </h2>
                <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Astrology & Spiritual Healing
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-auto lg:mx-0">
                  <p className="text-lg sm:text-xl text-yellow-300 font-medium mb-2">
                    "अपने भाग्य को जानें, अपनी किस्मत को बदलें"
                  </p>
                  <p className="text-gray-300">
                    "Know Your Destiny, Transform Your Fate"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                  <a href="https://wa.me/919034095999" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 font-bold shadow-lg transition-all duration-300 hover:scale-105">
                      <FaWhatsapp className="w-5 h-5 mr-2" />
                      📞 9034095999
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 text-lg px-8 py-4 font-bold transition-all duration-300 hover:scale-105"
                  >
                    <FaPhone className="w-5 h-5 mr-2" />
                    Call Now
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 px-6 py-3 rounded-full mb-8"
            >
              <FaOm className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Divine Services</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              हमारी सेवाएं
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our Services - Ancient Wisdom Meets Modern Solutions
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden h-full">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className={`w-20 h-20 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-purple-400 font-medium mb-4">
                          {service.subtitle}
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-gray-300 text-sm">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 flex-shrink-0"></span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
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
              className="inline-flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 px-6 py-3 rounded-full mb-8"
            >
              <FaStar className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Client Experiences</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              ग्राहकों की राय
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              What Our Clients Say - Real Transformations
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-300 italic text-lg leading-relaxed">
                        "{testimonial.text}"
                      </p>
                      <p className="text-gray-300 italic text-lg leading-relaxed">
                        "{testimonial.englishText}"
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <p className="text-white font-bold text-lg">{testimonial.name}</p>
                      <p className="text-purple-400 font-medium">{testimonial.englishName}</p>
                      <p className="text-gray-400 text-sm">{testimonial.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-6 py-3 rounded-full mb-8"
            >
              <FaHandHoldingHeart className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Transform Your Life Today</span>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
              अपना भाग्य जानने के लिए तैयार हैं?
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8">
              Ready to Discover Your Destiny?
            </p>
            
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 mb-8">
              <p className="text-lg sm:text-xl text-yellow-300 font-medium mb-4">
                "जीवन में सफलता और शांति पाने का समय आ गया है"
              </p>
              <p className="text-gray-300">
                "The time has come to achieve success and peace in life"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="https://wa.me/919034095999" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white text-xl px-10 py-6 font-bold shadow-lg transition-all duration-300 hover:scale-105">
                  <FaWhatsapp className="w-6 h-6 mr-3" />
                  📞 9034095999
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 text-xl px-10 py-6 font-bold transition-all duration-300 hover:scale-105"
              >
                <FaPhone className="w-6 h-6 mr-3" />
                Call Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex justify-center space-x-4 text-2xl">
              <FaOm className="text-purple-400" />
              <FaHandHoldingHeart className="text-pink-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Nitin Ahuja • Nityanand
            </h3>
            <p className="text-gray-400 text-lg">
              ज्योतिष और आध्यात्मिक उपचार • Astrology & Spiritual Healing
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <span>📞 9034095999</span>
              <span>📍 India</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
