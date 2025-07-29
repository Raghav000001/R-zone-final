"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FaUsers, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaCopy,
  FaCheck,
  FaSignOutAlt
} from "react-icons/fa";
import { MdOutlineCardMembership } from "react-icons/md";
import { BsCurrencyRupee } from "react-icons/bs";
import { toast } from "sonner";
import AddMemberDialog from "@/components/trainer/AddMemberDialog";

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
  photo?: string;
}

interface Trainer {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  specialization?: string;
  role?: string;
}

export default function TrainerDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const membershipTypes = ["Monthly", "Quarterly", "Half Yearly", "Yearly"];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, search, membershipFilter, statusFilter]);

  const checkAuth = async () => {
    try {
      console.log('Checking trainer authentication...');
      const response = await fetch('/api/trainers/me', {
        credentials: 'include'
      });
      
      console.log('Auth response status:', response.status);
      
      if (!response.ok) {
        console.log('Not authenticated, redirecting to login');
        // Not authenticated, redirect to login
        window.location.href = '/trainer/login';
        return;
      }
      
      const data = await response.json();
      console.log('Auth data received:', data);
      
      setTrainer({
        _id: data.trainer.id,
        name: data.trainer.name,
        email: data.trainer.email,
        role: data.trainer.role
      });
      
      // Fetch members after authentication
      await fetchMembers();
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/trainer/login';
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      console.log('Fetching members...');
      
      const response = await fetch('/api/trainers/members', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Members data received:', data);
        
        // Debug: Check photo data for each member
        if (Array.isArray(data)) {
          data.forEach((member, index) => {
            console.log(`Member ${index + 1} (${member.name}):`, {
              photoFront: member.photoFront ? `exists (${member.photoFront.length} chars)` : 'not set',
              photoBack: member.photoBack ? `exists (${member.photoBack.length} chars)` : 'not set',
              hasAnyPhoto: !!(member.photoFront || member.photoBack)
            });
          });
        }
        
        setMembers(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch members:', response.status, errorData);
        toast.error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Error fetching members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    // Search filter
    if (search) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        (member.phone && member.phone.includes(search))
      );
    }

    // Membership type filter
    if (membershipFilter !== "all") {
      filtered = filtered.filter(member => member.membershipType === membershipFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(member => {
        const status = getMemberStatus(member);
        return status.label === statusFilter;
      });
    }

    setFilteredMembers(filtered);
  };

  const getMemberStatus = (member: Member) => {
    if (!member.endDate) return { label: "ACTIVE", color: "green" };
    
    const endDate = new Date(member.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { label: "EXPIRED", color: "red" };
    if (daysUntilExpiry <= 7) return { label: "EXPIRES SOON", color: "yellow" };
    return { label: "ACTIVE", color: "green" };
  };

  const copyPhoneNumber = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      toast.success('Phone number copied to clipboard!');
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (error) {
      console.error('Failed to copy phone number:', error);
      toast.error('Failed to copy phone number');
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/trainers/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear client-side cookies and redirect
      document.cookie = "trainer-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = '/trainer/login';
    }
  };

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {trainer.photo ? (
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-400 text-sm sm:text-base" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">Trainer Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-400 truncate">Welcome back, {trainer.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-shrink-0"
            >
              <FaSignOutAlt className="mr-1 sm:mr-2 text-xs" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaUsers className="text-xl sm:text-2xl text-green-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Members Management</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Manage your assigned members and their memberships</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {/* Search */}
              <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  placeholder="Search members by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 text-sm sm:text-base"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Membership Filter */}
                <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                    <SelectValue placeholder="All Memberships" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Memberships</SelectItem>
                    {membershipTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="EXPIRES SOON">Expires Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Member Button */}
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end text-sm sm:text-base"
            >
              <FaPlus className="text-xs sm:text-sm" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-400 mt-4 text-sm sm:text-base">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FaUsers className="text-4xl sm:text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No members found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMembers.map((member) => {
              const status = getMemberStatus(member);
              return (
                <Card key={member._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                  <CardContent className="p-4 sm:p-6">
                    {/* Member Header - Fixed Photo Display */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {(() => {
                            // Priority: photoFront > photoBack (removed photo field since it's not being saved)
                            const photoToDisplay = member.photoFront || member.photoBack;
                            
                            if (photoToDisplay) {
                              return (
                                <img
                                  src={photoToDisplay}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(`Failed to load photo for ${member.name}:`, {
                                      photoFront: member.photoFront ? 'exists' : 'missing',
                                      photoBack: member.photoBack ? 'exists' : 'missing',
                                      attemptedSrc: photoToDisplay?.substring(0, 50) + '...' // Log first 50 chars of base64
                                    });
                                  }}
                                />
                              );
                            }
                            
                            return (
                              <FaUser className="text-gray-400 text-lg sm:text-xl" />
                            );
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-sm sm:text-base truncate">{member.name}</h3>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                            <FaEnvelope className="text-xs flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={status.color === "green" ? "default" : status.color === "red" ? "destructive" : "secondary"}
                        className={`${
                          status.color === "green" ? "bg-green-600" :
                          status.color === "red" ? "bg-red-600" :
                          "bg-yellow-600"
                        } text-xs flex-shrink-0 ml-2`}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* Contact Info with Copy Button */}
                    {member.phone && (
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-3 p-2 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                          <FaPhone className="text-xs flex-shrink-0" />
                          <span className="truncate">{member.phone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPhoneNumber(member.phone!)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-600 transition-colors flex-shrink-0"
                          title="Copy phone number"
                        >
                          {copiedPhone === member.phone ? (
                            <FaCheck className="text-xs text-green-400" />
                          ) : (
                            <FaCopy className="text-xs text-gray-400 hover:text-white" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Membership Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MdOutlineCardMembership className="text-green-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300 truncate">{member.membershipType}</span>
                      </div>
                      {member.amountPaid && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <BsCurrencyRupee className="text-green-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-300">Paid: ₹{member.amountPaid}</span>
                        </div>
                      )}
                      {member.amountBalance !== undefined && member.amountBalance !== null && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <BsCurrencyRupee className="text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-300">Balance: ₹{member.amountBalance}</span>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 mb-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                        <FaCalendarAlt className="text-xs flex-shrink-0" />
                        <span className="truncate">Start: {new Date(member.startDate).toLocaleDateString()}</span>
                      </div>
                      {member.endDate && (
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                          <FaCalendarAlt className="text-xs flex-shrink-0" />
                          <span className="truncate">Expires: {new Date(member.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingMember(member);
                          setShowAddDialog(true);
                        }}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 h-8 sm:h-9 text-xs sm:text-sm font-medium"
                      >
                        <FaEdit className="text-xs mr-1 sm:mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Member Dialog */}
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        member={editingMember}
        onSuccess={() => {
          setShowAddDialog(false);
          setEditingMember(null);
          fetchMembers();
        }}
      />
    </div>
  );
} 