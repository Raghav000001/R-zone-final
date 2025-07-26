import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCamera, FaUpload, FaUser, FaEnvelope, FaPhone, FaTimes } from "react-icons/fa";

interface Trainer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  specialization?: string;
  experience?: number;
  isActive: boolean;
}

interface AddTrainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer?: Trainer | null;
  onSuccess?: () => void;
}

const AddTrainerDialog: React.FC<AddTrainerDialogProps> = ({
  open,
  onOpenChange,
  trainer,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    experience: "",
    photo: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes or trainer changes
  useEffect(() => {
    if (open) {
      if (trainer) {
        setFormData({
          name: trainer.name || "",
          email: trainer.email || "",
          phone: trainer.phone || "",
          password: "", // Don't populate password for security
          specialization: trainer.specialization || "",
          experience: trainer.experience?.toString() || "",
          photo: trainer.photo || "",
          isActive: trainer.isActive,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          specialization: "",
          experience: "",
          photo: "",
          isActive: true,
        });
      }
    }
  }, [open, trainer]);

  // Camera functionality
  useEffect(() => {
    let stream: MediaStream | undefined;
    
    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user'
          } 
        });
        const video = document.getElementById("trainer-camera-video") as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      } catch (error) {
        console.error("Camera access denied or not available:", error);
        alert("Camera access denied or not available");
        setIsCameraModalOpen(false);
      }
    }
    
    if (isCameraModalOpen && !isPhotoTaken) {
      enableCamera();
    }
    
    return () => {
      // Clean up camera stream when modal closes
      const video = document.getElementById("trainer-camera-video") as HTMLVideoElement;
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, [isCameraModalOpen, isPhotoTaken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({ ...prev, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = () => {
    const video = document.getElementById("trainer-camera-video") as HTMLVideoElement;
    const canvas = document.getElementById("trainer-camera-canvas") as HTMLCanvasElement;
    
    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL("image/jpeg", 0.8);
        setCurrentPhoto(photoData);
        setIsPhotoTaken(true);
        
        // Stop video stream but keep modal open for preview
        if (video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          video.srcObject = null;
        }
      }
    }
  };

  const handleUsePhoto = () => {
    if (currentPhoto) {
      console.log('Setting trainer photo');
      setFormData(prev => ({ ...prev, photo: currentPhoto }));
      
      // Use setTimeout to ensure the photo is set before closing modal
      setTimeout(() => {
        setIsCameraModalOpen(false);
        setIsPhotoTaken(false);
        setCurrentPhoto("");
      }, 100);
    }
  };

  const handleRetake = () => {
    setCurrentPhoto("");
    setIsPhotoTaken(false);
  };

  const uploadToCloudinary = async (imageData: string): Promise<string> => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return imageData; // Return base64 if upload fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const trainerData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: parseInt(formData.experience) || 0,
        photo: formData.photo,
        isActive: formData.isActive,
        role: "trainer",
      };

      // Only include password if it's a new trainer or password was changed
      if (!trainer || formData.password) {
        trainerData.password = formData.password;
      }

      console.log('Submitting trainerData:', trainerData);

      const url = trainer ? `/api/trainers?id=${trainer._id}` : '/api/trainers';
      const method = trainer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainerData),
        credentials: 'include',
      });

      if (response.ok) {
        onSuccess?.();
        onOpenChange(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving trainer:', error);
      alert('Failed to save trainer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCamera = () => {
    setIsCameraModalOpen(true);
    setIsPhotoTaken(false);
  };

  const stopCamera = () => {
    const video = document.getElementById("trainer-camera-video") as HTMLVideoElement;
    if (video && video.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
    setIsCameraModalOpen(false);
    setIsPhotoTaken(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto bg-gray-900 border-gray-700 p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <FaUser className="text-blue-400 text-lg sm:text-xl" />
              {trainer ? 'Edit Trainer' : 'Add New Trainer'}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm sm:text-base">
              Fill in the trainer details below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Photo Section */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <Label className="text-white font-semibold mb-3 sm:mb-4 block text-sm sm:text-base">Trainer Photo</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Photo Display */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-600 flex items-center justify-center bg-gray-700 overflow-hidden">
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Trainer photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-2xl sm:text-4xl text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Photo Controls */}
                <div className="flex-1 w-full sm:w-auto space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto text-sm"
                    >
                      <FaUpload className="mr-2 text-xs" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Trainer camera button clicked');
                        startCamera();
                      }}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto text-sm"
                    >
                      <FaCamera className="mr-2 text-xs" />
                      Take Photo
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium text-sm sm:text-base">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white font-medium text-sm sm:text-base">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white font-medium text-sm sm:text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>

                {!trainer && (
                  <div>
                    <Label htmlFor="password" className="text-white font-medium text-sm sm:text-base">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required={!trainer}
                      className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="specialization" className="text-white font-medium text-sm sm:text-base">
                    Specialization
                  </Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) => handleSelectChange('specialization', value)}
                  >
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white text-sm sm:text-base">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="CrossFit">CrossFit</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Strength Training">Strength Training</SelectItem>
                      <SelectItem value="Weight Training & Bodybuilding">Weight Training & Bodybuilding</SelectItem>
                      <SelectItem value="Pilates">Pilates</SelectItem>
                      <SelectItem value="Zumba">Zumba</SelectItem>
                      <SelectItem value="General Fitness">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white font-medium text-sm sm:text-base">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Enter years of experience"
                    className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="text-white font-medium text-sm sm:text-base">
                    Active Trainer
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-sm sm:text-base"
              >
                {isSubmitting ? 'Saving...' : (trainer ? 'Save Changes' : 'Add Trainer')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <Dialog open={isCameraModalOpen} onOpenChange={(open) => {
        if (!open) stopCamera();
        setIsCameraModalOpen(open);
      }}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6 bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-white">Take Trainer Photo</DialogTitle>
          </DialogHeader>
          {!isPhotoTaken ? (
            <div className="space-y-4">
              <video
                id="trainer-camera-video"
                autoPlay
                playsInline
                className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg"
              />
              <canvas id="trainer-camera-canvas" className="hidden" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={capturePhoto} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  <FaCamera className="mr-2 text-xs" />
                  Capture
                </Button>
                <Button
                  onClick={() => setIsCameraModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <img 
                src={currentPhoto} 
                alt="Captured" 
                className="w-full h-48 sm:h-64 object-contain bg-gray-100 rounded-lg" 
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setCurrentPhoto("");
                    setIsPhotoTaken(false);
                    startCamera();
                  }}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 text-sm sm:text-base"
                >
                  <FaCamera className="mr-2 text-xs" />
                  Retake
                </Button>
                <Button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, photo: currentPhoto }));
                    setIsCameraModalOpen(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  Use Photo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTrainerDialog;