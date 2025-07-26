"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaUser, FaEnvelope, FaPhone, FaUsers, FaSearch, FaFilter, FaEye, FaEdit, FaPlus, FaArrowLeft } from "react-icons/fa";

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
  photo?: string;
  amountPaid?: number;
}

export default function AllMembersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Add actual admin auth check here
    setAuthorized(true);
    fetchMembers();
  }, []);

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const trainerToken = localStorage.getItem('trainer-token');
      const response = await fetch('/api/trainers/members', {
        headers: {
          'Authorization': `Bearer ${trainerToken}`,
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
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

  // Get member status
  const getMemberStatus = (member: Member) => {
    if (!member.endDate) return { status: "unknown", label: "Unknown", color: "gray" };
    
    const today = new Date();
    const endDate = new Date(member.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "expired", label: "EXPIRED", color: "red" };
    } else if (diffDays <= 7) {
      return { status: "expires-soon", label: "EXPIRES SOON", color: "yellow" };
    } else {
      return { status: "active", label: "ACTIVE", color: "green" };
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getMemberStatus(member);
    const matchesStatus = filterStatus === "all" || status.status === filterStatus;
    const matchesPlan = filterPlan === "all" || member.membershipType.toLowerCase() === filterPlan.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (!authorized) {
    return <div className="p-8 text-center text-xl">Checking authorization...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Members</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage all gym members</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FaPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expires-soon">Expires Soon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading members...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMembers.map((member) => {
            const status = getMemberStatus(member);
            return (
              <Card key={member._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {member.photo ? (
                          <img 
                            src={member.photo} 
                            alt={member.name} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        ) : member.photoFront ? (
                          <img 
                            src={member.photoFront} 
                            alt={member.name} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        ) : (
                          <FaUser className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center">
                            <FaEnvelope className="w-3 h-3 mr-1" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center">
                              <FaPhone className="w-3 h-3 mr-1" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={status.color === "green" ? "default" : status.color === "red" ? "destructive" : "secondary"}>
                        {status.label}
                      </Badge>
                      <Badge variant="outline">{member.membershipType}</Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FaEye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FaEdit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No members found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
