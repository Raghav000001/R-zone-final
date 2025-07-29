"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedAuth) return; // Prevent multiple checks
      
      // Check if we just logged out (URL parameter)
      const urlParams = new URLSearchParams(window.location.search);
      const justLoggedOut = urlParams.get('logout');
      
      if (justLoggedOut === 'true') {
        console.log('Just logged out, skipping auth check');
        setHasCheckedAuth(true);
        // Remove the logout parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // Additional check for mobile browsers - clear any stale cookies
      if (typeof window !== 'undefined') {
        // Force clear any existing auth cookies on mobile
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        document.cookie = "trainer-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      }
      
      try {
        console.log('Checking admin authentication...');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        });
        console.log('Auth check response:', response.status);
        
        if (response.ok) {
          // User is already logged in, redirect to dashboard
          console.log('User authenticated, redirecting to dashboard');
          window.location.replace('/admin/dashboard');
        } else {
          console.log('User not authenticated, staying on login page');
          setHasCheckedAuth(true);
        }
      } catch (error) {
        // User is not logged in, stay on login page
        console.log('Auth check error:', error);
        setHasCheckedAuth(true);
      }
    };

    // Add a longer delay for mobile browsers
    const delay = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 2000 : 1000;
    const timer = setTimeout(checkAuth, delay);
    return () => clearTimeout(timer);
  }, [hasCheckedAuth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "super_admin" // Add the required role field
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to dashboard
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <FaUser className="text-2xl text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Admin Login
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Sign in to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 pl-10"
                  />
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 pl-10 pr-10"
                  />
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

           
          
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
