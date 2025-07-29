import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCamera, FaUpload, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { BsCurrencyRupee } from "react-icons/bs";
import { useToast } from "@/hooks/use-toast"; // Add toast import

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  membershipType: string;
  startDate: string;
  endDate?: string;
  photoFront?: string;
  photoBack?: string;
  galleryPhotos?: string[];
  amountPaid?: number;
  amountBalance?: number;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  onSuccess?: () => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  member,
  onSuccess
}) => {
  const { toast } = useToast(); // Add toast hook
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "",
    startDate: "",
    endDate: "",
    amountPaid: "",
    amountBalance: "0",
    photoFront: "",
    photoBack: "",
    galleryPhotos: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraSide, setCameraSide] = useState<'front' | 'back'>('front');
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes or member changes
  useEffect(() => {
    if (open) {
      if (member) {
        console.log('Loading member data:', member);
        console.log('amountPaid:', member.amountPaid, 'amountBalance:', member.amountBalance);
        setFormData({
          name: member.name || "",
          email: member.email || "",
          phone: member.phone || "",
          membershipType: member.membershipType || "",
          startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : "",
          endDate: member.endDate ? new Date(member.endDate).toISOString().split('T')[0] : "",
          amountPaid: member.amountPaid?.toString() || "0",
          amountBalance: (member.amountBalance !== undefined && member.amountBalance !== null) ? member.amountBalance.toString() : "0",
          photoFront: member.photoFront || "",
          photoBack: member.photoBack || "",
          galleryPhotos: member.galleryPhotos || [],
        });
      } else {
        console.log('Setting default form data with amountBalance: "0"');
        setFormData({
          name: "",
          email: "",
          phone: "",
          membershipType: "",
          startDate: "",
          endDate: "",
          amountPaid: "",
          amountBalance: "0",
          photoFront: "",
          photoBack: "",
          galleryPhotos: [],
        });
      }
    }
  }, [open, member]);

  // Camera functionality
  useEffect(() => {
    let stream: MediaStream | undefined;
    
    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: cameraSide === 'front' ? 'user' : 'environment' 
          } 
        });
        const video = document.getElementById("camera-video") as HTMLVideoElement;
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
      const video = document.getElementById("camera-video") as HTMLVideoElement;
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, [isCameraModalOpen, isPhotoTaken, cameraSide]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input change:', e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (side: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (side === 'front') {
        setFormData(prev => ({ ...prev, photoFront: result }));
      } else {
        setFormData(prev => ({ ...prev, photoBack: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = () => {
    const video = document.getElementById("camera-video") as HTMLVideoElement;
    const canvas = document.getElementById("camera-canvas") as HTMLCanvasElement;
    
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
      const memberData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        membershipType: formData.membershipType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        photoFront: formData.photoFront,
        photoBack: formData.photoBack,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        amountBalance: parseFloat(formData.amountBalance) || 0,
      };

      console.log('Submitting memberData:', memberData);
      console.log('photoFront:', formData.photoFront ? 'exists' : 'not set');
      console.log('photoBack:', formData.photoBack ? 'exists' : 'not set');
      console.log('amountPaid value:', formData.amountPaid, 'parsed:', parseFloat(formData.amountPaid));
      console.log('amountBalance value:', formData.amountBalance, 'parsed:', parseFloat(formData.amountBalance));

      const url = member ? `/api/trainers/members?id=${member._id}` : '/api/trainers/members';
      const method = member ? 'PUT' : 'POST';
      const trainerToken = typeof window !== 'undefined' ? localStorage.getItem('trainer-token') : null;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(trainerToken ? { 'Authorization': `Bearer ${trainerToken}` } : {})
        },
        body: JSON.stringify(memberData),
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
      console.error('Error saving member:', error);
      // User-friendly error: show toast for member limit and generic errors
    let message = 'Failed to save member. Please try again.';
    if (error instanceof Error && error.message.includes('Maximum member limit')) {
      message = error.message;
    }
    if (typeof toast === 'function') {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } else {
      alert(message);
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentPhoto = () => {
    return cameraSide === 'front' ? formData.photoFront : formData.photoBack;
  };

  const startCamera = () => {
    setIsCameraModalOpen(true);
    setIsPhotoTaken(false);
  };

  const stopCamera = () => {
    const video = document.getElementById("camera-video") as HTMLVideoElement;
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
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto bg-gray-900 border-gray-700 mx-auto">
          <DialogHeader className="px-2 sm:px-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <FaUser className="text-green-400 text-lg sm:text-xl" />
              {member ? 'Edit Member' : 'Add New Member'}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm sm:text-base">
              Fill in the member details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 px-2 sm:px-6 pb-6">
            {/* Photo Section */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <Label className="text-white font-semibold mb-3 sm:mb-4 block text-sm sm:text-base">Member Photo</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Photo Display */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-600 flex items-center justify-center bg-gray-700 overflow-hidden">
                    {getCurrentPhoto() ? (
                      <img
                        src={getCurrentPhoto()}
                        alt="Member photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-2xl sm:text-4xl text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Photo Controls */}
                <div className="flex-1 w-full space-y-3 sm:space-y-4">
                  {/* Side Selection */}
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Button
                      type="button"
                      variant={cameraSide === 'front' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCameraSide('front')}
                      className={`text-xs sm:text-sm px-3 sm:px-4 ${cameraSide === 'front' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600 text-gray-300'}`}
                    >
                      Front
                    </Button>
                    <Button
                      type="button"
                      variant={cameraSide === 'back' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCameraSide('back')}
                      className={`text-xs sm:text-sm px-3 sm:px-4 ${cameraSide === 'back' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600 text-gray-300'}`}
                    >
                      Back
                    </Button>
                  </div>

                  {/* Photo Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 h-8 sm:h-9 text-xs sm:text-sm font-medium"
                      >
                      <FaUpload className="mr-2 text-xs sm:text-sm" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Trainer member camera button clicked');
                        setIsCameraModalOpen(true);
                      }}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 h-8 sm:h-9 text-xs sm:text-sm font-medium"
                      >
                      <FaCamera className="mr-2 text-xs sm:text-sm" />
                      Take Photo
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload(cameraSide)}
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
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white font-medium text-sm sm:text-base">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate" className="text-white font-medium text-sm sm:text-base">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-600 text-white focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="amountPaid" className="text-white font-medium text-sm sm:text-base">
                    Amount Paid (₹) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <BsCurrencyRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                    <Input
                      id="amountPaid"
                      name="amountPaid"
                      type="number"
                      value={formData.amountPaid}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="pl-8 sm:pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="amountBalance" className="text-white font-medium text-sm sm:text-base">
                    Amount Balance (₹) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <BsCurrencyRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                    <Input
                      id="amountBalance"
                      name="amountBalance"
                      type="number"
                      value={formData.amountBalance}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="pl-8 sm:pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3 sm:space-y-4">
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
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="membershipType" className="text-white font-medium text-sm sm:text-base">
                    Membership Plan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.membershipType}
                    onValueChange={(value) => handleSelectChange('membershipType', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="Elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-white font-medium text-sm sm:text-base">
                    Expiry Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-600 text-white focus:border-green-500 text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm sm:text-base h-10 sm:h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base h-10 sm:h-11 w-full sm:w-auto"
              >
                {isSubmitting ? 'Saving...' : (member ? 'Save Changes' : 'Add Member')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

            {/* Camera Modal */}
      <Dialog open={isCameraModalOpen} onOpenChange={(open) => {
        if (!open) stopCamera();
        setIsCameraModalOpen(open);
      }}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-md 
                                  h-auto max-h-[90vh] 
                                  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                                  overflow-y-auto bg-gray-900 border-gray-700 
                                  p-4 sm:p-5 lg:p-6 rounded-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl font-bold text-white text-center">
              Take Member Photo
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            {!isPhotoTaken ? (
              <>
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  className="w-full max-w-sm h-64 sm:h-72 bg-gray-200 rounded-lg object-cover"
                />
                <canvas id="camera-canvas" className="hidden" />
                <div className="flex flex-col w-full max-w-sm space-y-3">
                  <Button 
                    onClick={capturePhoto} 
                    className="bg-green-600 hover:bg-green-700 text-white
                              text-base py-3 px-6 h-12 w-full"
                  >
                    <FaCamera className="mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    onClick={() => setIsCameraModalOpen(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700
                              text-base py-3 px-6 h-12 w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <img 
                  src={currentPhoto} 
                  alt="Captured" 
                  className="w-full max-w-sm h-64 sm:h-72 object-contain bg-gray-100 rounded-lg" 
                />
                <div className="flex flex-col w-full max-w-sm space-y-3">
                  <Button
                    onClick={() => {
                      setCurrentPhoto("");
                      setIsPhotoTaken(false);
                      startCamera();
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700
                              text-base py-3 px-6 h-12 w-full"
                  >
                    <FaCamera className="mr-2" />
                    Retake Photo
                  </Button>
                                      <Button
                      onClick={() => {
                        console.log('Use Photo clicked - cameraSide:', cameraSide);
                        console.log('Use Photo clicked - currentPhoto length:', currentPhoto.length);
                        if (cameraSide === 'front') {
                          console.log('Setting photoFront');
                          setFormData(prev => ({ ...prev, photoFront: currentPhoto }));
                        } else {
                          console.log('Setting photoBack');
                          setFormData(prev => ({ ...prev, photoBack: currentPhoto }));
                        }
                        setIsCameraModalOpen(false);
                      }}
                    className="bg-green-600 hover:bg-green-700 text-white
                              text-base py-3 px-6 h-12 w-full"
                  >
                    Use Photo
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddMemberDialog;