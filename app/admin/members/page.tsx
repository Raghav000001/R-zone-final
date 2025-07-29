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
  FaTrash, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaCopy,
  FaCheck
} from "react-icons/fa";
import { MdOutlineCardMembership } from "react-icons/md";
import { BsCurrencyRupee } from "react-icons/bs";
import { toast } from "sonner";
import AddMemberDialog from "@/components/admin/AddMemberDialog";

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

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);


  const membershipTypes = ["Monthly", "Quarterly", "Half Yearly", "Yearly"];

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, search, membershipFilter, statusFilter]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
        console.log('Fetched members:', data);
        
        // Debug: Check amountBalance for each member
        data.forEach((member: Member, index: number) => {
          console.log(`Member ${index + 1} (${member.name}): amountBalance = ${member.amountBalance}`);
        });
      } else {
        console.error('Failed to fetch members');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Member deleted successfully');
        fetchMembers();
      } else {
        toast.error('Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Error deleting member');
    }
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



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Manage Members</h1>
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs sm:text-sm">
                {filteredMembers.length} Members
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-sm sm:text-base"
              >
                <FaPlus className="mr-2 text-xs sm:text-sm" />
                Add Member
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search - Full width on mobile */}
            <div className="w-full">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  placeholder="Search members by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 sm:pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 
                            focus:border-green-500 w-full text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
            </div>

            {/* Filters - Stack on mobile, inline on larger screens */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Membership Filter */}
              <div className="w-full sm:w-48 lg:w-56">
                <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="All Memberships" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Memberships</SelectItem>
                    {membershipTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-40 lg:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-10 sm:h-11 text-sm sm:text-base">
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
          </div>
        </div>

        {/* Members Grid - Responsive columns */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-400 mt-4 text-sm sm:text-base">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FaUsers className="text-4xl sm:text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No members found</h3>
            <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {filteredMembers.map((member) => {
              console.log('Member card data:', member);
              console.log('amountPaid:', member.amountPaid, 'amountBalance:', member.amountBalance);
              const status = getMemberStatus(member);
              return (
                <Card key={member._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    {/* Member Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : member.photoFront ? (
                            <img
                              src={member.photoFront}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : member.photoBack ? (
                            <img
                              src={member.photoBack}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUser className="text-gray-400 text-lg sm:text-xl" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm sm:text-base">{member.name}</h3>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                            <FaEnvelope className="text-xs flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={status.color === "green" ? "default" : status.color === "red" ? "destructive" : "secondary"}
                        className={`text-xs flex-shrink-0 ml-2 ${
                          status.color === "green" ? "bg-green-600" :
                          status.color === "red" ? "bg-red-600" :
                          "bg-yellow-600"
                        }`}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* Contact Info with Copy Button */}
                    {member.phone && (
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 p-2 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                          <FaPhone className="text-xs flex-shrink-0" />
                          <span className="truncate">{member.phone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPhoneNumber(member.phone!)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-600 transition-colors flex-shrink-0 ml-2"
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
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MdOutlineCardMembership className="text-green-400 text-sm sm:text-base flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300 truncate">{member.membershipType}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <BsCurrencyRupee className="text-green-400 text-sm sm:text-base flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300">Paid: ₹{member.amountPaid || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <BsCurrencyRupee className="text-blue-400 text-sm sm:text-base flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300">Balance: ₹{member.amountBalance || 0}</span>
                      </div>
                    </div>


                    {/* Dates */}
                    <div className="space-y-1 mb-3 sm:mb-4 text-xs sm:text-sm">
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
                        size="sm"
                        onClick={() => {
                          setEditingMember(member);
                          setShowAddDialog(true);
                        }}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <FaEdit className="text-xs mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member._id)}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-8 sm:h-9 w-8 sm:w-9 p-0"
                      >
                        <FaTrash className="text-xs" />
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