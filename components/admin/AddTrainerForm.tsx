"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AddTrainerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    rating: "",
    students: "",
    bio: "",
    certifications: "",
    languages: "",
    availability: "",
    image: "",
    file: undefined as File | undefined,
    previewUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setFormData((prev) => ({
        ...prev,
        file,
        previewUrl: file ? URL.createObjectURL(file) : "",
      }));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (formData.file) {
        const uploadData = new FormData();
        uploadData.append("file", formData.file);
        uploadData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: uploadData,
        });
        const cloudData = await cloudRes.json();
        imageUrl = cloudData.secure_url;
      }
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          file: undefined,
          previewUrl: undefined,
          specialization: formData.specialization.split(",").map((s) => s.trim()).filter(Boolean),
          certifications: formData.certifications.split(",").map((c) => c.trim()).filter(Boolean),
          languages: formData.languages.split(",").map((l) => l.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Trainer Added", description: "Trainer has been added successfully." });
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          specialization: "",
          experience: "",
          rating: "",
          students: "",
          bio: "",
          certifications: "",
          languages: "",
          availability: "",
          image: "",
          file: undefined,
          previewUrl: "",
        });
        if (onSuccess) onSuccess();
      } else {
        toast({ title: "Error", description: data.error || "Failed to add trainer.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Add New Trainer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="specialization">Specialization (comma separated)</Label>
            <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" name="experience" value={formData.experience} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="rating">Rating</Label>
            <Input id="rating" name="rating" type="number" value={formData.rating} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="students">Students</Label>
            <Input id="students" name="students" type="number" value={formData.students} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" name="bio" value={formData.bio} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="certifications">Certifications (comma separated)</Label>
            <Input id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="languages">Languages (comma separated)</Label>
            <Input id="languages" name="languages" value={formData.languages} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="availability">Availability</Label>
            <Input id="availability" name="availability" value={formData.availability} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="file">Profile Image</Label>
            <Input id="file" name="file" type="file" accept="image/*" onChange={handleChange} />
            {formData.previewUrl && (
              <img src={formData.previewUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Trainer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
