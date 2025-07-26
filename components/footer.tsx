import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Instagram, Facebook, Clock, Users, Award } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Get In Touch Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-orange-500 font-bold mb-6">
              Get In Touch
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Ready to start your fitness journey? Contact us today and take the first step towards a healthier you!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Location Card */}
            <Card className="bg-gray-800 hover:scale-105  border-gray-700 hover:border-blue-500/30 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-green-600 font-bold">Location</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-white font-medium">R-Zone Fitness Gym</p>
                <p className="text-gray-300">Rohtak, Haryana 124001</p>
                <p className="text-gray-300">Near Gohana Adda, Rohtak</p>
                <a 
                  href="https://www.google.com/maps/dir//Kirpal+Nagar,+Rohtak,+Haryana+124001/@28.9030485,76.5005716,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x390d85bd35e73f17:0x6ef1d3e8d579f74c!2m2!1d76.582973!2d28.9030736?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Get Directions on Google Maps
                </a>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="bg-gray-800 border-gray-700 hover:scale-105 hover:border-blue-500/30 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-green-600 font-bold">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-white font-medium">+91-9034095999</p>
                <p className="text-gray-300">24/7 Support Available</p>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/30 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-green-600 font-bold">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-white font-medium">info@rzonefitness.com</p>
                <p className="text-white font-medium">support@rzonefitness.com</p>
                <p className="text-gray-300">Quick Response Guaranteed</p>
              </CardContent>
            </Card>
          </div>

          {/* Map Card */}
          <Card className="bg-gray-800 border-gray-700 mb-16">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Find Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Map */}
                <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3498.1234567890123!2d76.582973!3d28.9030736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d85bd35e73f17%3A0x6ef1d3e8d579f74c!2sKirpal%20Nagar%2C%20Rohtak%2C%20Haryana%20124001!5e0!3m2!1sen!2sin!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="R-Zone Fitness Gym Location"
                  ></iframe>
                </div>
                
                {/* Location Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Heart of the City</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Located in the vibrant heart of Rohtak, R-Zone Fitness Gym is strategically positioned 
                      for easy access from all parts of the city. Our prime location near Mata Darwaja makes 
                      it convenient for everyone to reach us.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Surrounded by major landmarks and easily accessible via public transport, 
                      our gym is the perfect destination for your fitness journey.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span className="text-gray-300">Near Mata Darwaja</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span className="text-gray-300">Close to major landmarks</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span className="text-gray-300">Easy parking available</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span className="text-gray-300">Public transport accessible</span>
                    </div>
                  </div>
                  
                  <a 
                    href="https://www.google.com/maps/dir//Kirpal+Nagar,+Rohtak,+Haryana+124001/@28.9030485,76.5005716,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x390d85bd35e73f17:0x6ef1d3e8d579f74c!2m2!1d76.582973!2d28.9030736?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Get Directions on Google Maps →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/trainers" className="text-gray-300 hover:text-white transition-colors">Trainers</Link></li>
                <li><Link href="/ai-planner" className="text-gray-300 hover:text-white transition-colors">AI Planner</Link></li>
                <li><Link href="/yoga" className="text-gray-300 hover:text-white transition-colors">Yoga</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-300">Personal Training</span></li>
                <li><span className="text-gray-300">Group Classes</span></li>
                <li><span className="text-gray-300">Yoga Sessions</span></li>
                <li><span className="text-gray-300">Fitness Assessment</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Membership</h3>
              <ul className="space-y-2">
                <li><Link href="/pricing-details" className="text-gray-300 hover:text-white transition-colors">Pricing Plans</Link></li>
                <li><span className="text-gray-300">1 day Free Trial</span></li>
               
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/rzone_fitness?igsh=MXF1amhpYzdtbGNjdw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center hover:from-gray-300 hover:to-gray-500 transition-all duration-300"
                >
                  <Instagram className="w-5 h-5 text-pink-800" />
                </a>
                <a 
                  href="https://www.facebook.com/RZoneFitnessCenter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center hover:from-gray-300 hover:to-gray-500 transition-all duration-300"
                >
                  <Facebook className="w-5 h-5 text-blue-900" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 R-Zone Fitness Gym. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </footer>
  )
}
