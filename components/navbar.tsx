"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Dumbbell } from "lucide-react"
import { motion } from "framer-motion"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/gym-tour", label: "Gym Tour" },
    { href: "/yoga", label: "Yoga" },
    { href: "/astrology", label: "Astrology" },
    { href: "/trainers", label: "Trainers" },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">R-Zone Fitness Gym</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  href={item.href} 
                  className="text-sm font-medium text-white/90 transition-colors hover:text-white relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right side buttons */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="hidden md:flex space-x-2">
              <Link href="/admin/login">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  Admin
                </Button>
              </Link>
              <Link href="/trainer/login">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  Trainer
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col space-y-4 p-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link 
                    href={item.href} 
                    className="text-lg font-medium text-white/90 transition-colors hover:text-white block py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              
              {/* Mobile Login Buttons */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700">
                <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                    Admin Login
                  </Button>
                </Link>
                <Link href="/trainer/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                    Trainer Login
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
