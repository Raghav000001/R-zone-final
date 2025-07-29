"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, Upload, User, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CameraModal from "@/components/CameraModal";

export default function AddMemberPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    plan: "",
    subscription: "",
    medicalConditions: "",
    fitnessGoals: "",
    amountBalance: "",
    photo: null as File | string | null,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  // CameraModal state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }))
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.plan) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/trainers/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('trainer-token') || ''}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast({
          title: "Member Added Successfully!",
          description: `${formData.name} has been added to your member list.`,
        });
        setIsSubmitting(false);
        window.location.href = "/trainer/members";
      } else {
        const errorData = await response.json().catch(() => ({}));
        let message = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        if (message.includes('Maximum member limit')) {
          toast({
            title: 'Member Limit Reached',
            description: message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
          });
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save member. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(imageSrc) => {
          setPhotoPreview(imageSrc);
          setFormData((prev) => ({ ...prev, photo: imageSrc as string }));
          setIsCameraModalOpen(false);
        }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/trainer/members">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Add New Member</h1>
                <p className="text-gray-600 dark:text-gray-300">Add a new member to your training program</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Photo Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Member Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Member preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={removePhoto}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    <div className="flex flex-col space-y-2 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCameraModalOpen(true)}
                        className="w-full bg-transparent"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-transparent"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload from Gallery
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          placeholder="Enter age"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter complete address"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                          placeholder="Enter emergency contact name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Membership Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Membership Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Membership Plan *</Label>
                        <Select onValueChange={(value) => handleInputChange("plan", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select membership plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic - ₹2,999/month</SelectItem>
                            <SelectItem value="premium">Premium - ₹4,999/month</SelectItem>
                            <SelectItem value="elite">Elite - ₹7,999/month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Subscription Type *</Label>
                        <Select onValueChange={(value) => handleInputChange("subscription", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly (10% off)</SelectItem>
                            <SelectItem value="yearly">Yearly (20% off)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amountBalance">Amount Balance</Label>
                      <Input
                        id="amountBalance"
                        type="number"
                        value={formData.amountBalance}
                        onChange={(e) => handleInputChange("amountBalance", e.target.value)}
                        placeholder="Enter amount balance"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Health & Fitness Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Health & Fitness Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea
                        id="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                        placeholder="Please mention any medical conditions, injuries, or health concerns..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fitnessGoals">Fitness Goals</Label>
                      <Textarea
                        id="fitnessGoals"
                        value={formData.fitnessGoals}
                        onChange={(e) => handleInputChange("fitnessGoals", e.target.value)}
                        placeholder="What are the member's fitness goals and expectations?"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link href="/trainer/members">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Member...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Member
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
