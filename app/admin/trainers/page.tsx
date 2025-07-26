"use client";

import React, { useState } from "react";
import { FaUsers, FaSearch, FaPlus, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaEdit, FaTrash, FaDumbbell, FaStar } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";
import AddTrainerDialog from "@/components/admin/AddTrainerDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = React.useState<Trainer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  // Fetch trainers
  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trainers");
      const data = await res.json();
      setTrainers(data.trainers || []);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTrainers();
  }, []);

  // Filter and search logic
  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch = 
      trainer.name.toLowerCase().includes(search.toLowerCase()) ||
      trainer.email.toLowerCase().includes(search.toLowerCase()) ||
      (trainer.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (trainer.specialization || "").toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = trainer.isActive;
    else if (statusFilter === "inactive") matchesStatus = !trainer.isActive;
    
    return matchesSearch && matchesStatus;
  });

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    
    try {
      const res = await fetch(`/api/trainers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTrainers();
      }
    } catch (error) {
      console.error("Error deleting trainer:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaDumbbell className="text-xl sm:text-2xl text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Trainers Management</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Manage gym trainers, their profiles, and access</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  placeholder="Search trainers by name, email, or specialization..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Trainer Button */}
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end text-sm sm:text-base"
            >
              <FaPlus className="text-xs sm:text-sm" />
              Add Trainer
            </Button>
          </div>
        </div>

        {/* Trainers Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-4 text-sm sm:text-base">Loading trainers...</p>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FaDumbbell className="text-4xl sm:text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No trainers found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredTrainers.map((trainer) => (
              <Card key={trainer._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  {/* Trainer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {trainer.photo ? (
                          <img
                            src={trainer.photo}
                            alt={trainer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const icon = target.nextElementSibling as HTMLElement;
                              if (icon) icon.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <FaUser className={`text-gray-400 text-lg sm:text-xl ${trainer.photo ? 'hidden' : ''}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white text-sm sm:text-base truncate">{trainer.name}</h3>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                          <FaEnvelope className="text-xs flex-shrink-0" />
                          <span className="truncate">{trainer.email}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={trainer.isActive ? "default" : "secondary"}
                      className={`${trainer.isActive ? "bg-green-600" : "bg-gray-600"} text-xs flex-shrink-0 ml-2`}
                    >
                      {trainer.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  {trainer.phone && (
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-3">
                      <FaPhone className="text-xs flex-shrink-0" />
                      <span className="truncate">{trainer.phone}</span>
                    </div>
                  )}

                  {/* Trainer Details */}
                  <div className="space-y-2 mb-4">
                    {trainer.specialization && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MdOutlineWork className="text-blue-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300 truncate">{trainer.specialization}</span>
                      </div>
                    )}
                    {trainer.experience && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FaStar className="text-yellow-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300">{trainer.experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTrainer(trainer);
                        setShowAddDialog(true);
                      }}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 h-9 text-sm font-medium"
                    >
                      <FaEdit className="text-sm mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(trainer._id)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white sm:w-auto w-full text-xs sm:text-sm"
                    >
                      <FaTrash className="text-xs" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Trainer Dialog */}
      <AddTrainerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        trainer={editingTrainer}
        onSuccess={() => {
          setShowAddDialog(false);
          setEditingTrainer(null);
          fetchTrainers();
        }}
      />
    </div>
  );
}