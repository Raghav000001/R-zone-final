"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Filter, Eye, Edit, Plus, ArrowLeft } from "lucide-react"
import { FaUser, FaEnvelope, FaPhone, FaUsers, FaSearch, FaFilter, FaEye, FaEdit, FaPlus, FaArrowLeft } from "react-icons/fa"

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
  amountBalance?: number;
}

export default function TrainerMembersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPlan, setFilterPlan] = useState("all")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        credentials: 'include'
      });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const status = getMemberStatus(member);
    const matchesStatus = filterStatus === "all" || status.status === filterStatus
    const matchesPlan = filterPlan === "all" || member.membershipType.toLowerCase() === filterPlan.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/trainer/dashboard">
                <Button variant="ghost" size="icon">
                  <FaArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Members</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your assigned members</p>
              </div>
            </div>
            <Link href="/trainer/members/add">
              <Button className="bg-green-600 hover:bg-green-700">
                <FaPlus className="h-4 w-4 mr-2" />
                Add New Member
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaFilter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FaUsers className="h-4 w-4 mr-2" />
                {filteredMembers.length} members found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p>Loading members...</p>
              ) : filteredMembers.length === 0 ? (
                <p>No members found matching your criteria.</p>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow space-y-3 lg:space-y-0"
                  >
                    {/* Left Section - User Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {(member.photoFront || member.photo) ? (
                          <img
                            src={member.photoFront || member.photo}
                            alt={member.name}
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
                        <FaUser className={`text-gray-400 text-xl ${(member.photoFront || member.photo) ? 'hidden' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{member.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{member.email}</p>
                        {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
                      </div>
                    </div>

                    {/* Right Section - Details and Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-3 lg:space-y-0">
                      {/* Member Details */}
                      <div className="flex flex-col space-y-2 lg:text-right">
                        {/* Status and Membership Type */}
                        <div className="flex flex-wrap items-center lg:justify-end gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {member.membershipType}
                          </Badge>
                          <Badge 
                            variant={getMemberStatus(member).color === "green" ? "default" : 
                                   getMemberStatus(member).color === "red" ? "destructive" : "secondary"}
                            className={`text-xs ${
                              getMemberStatus(member).color === "green" ? "bg-green-600" :
                              getMemberStatus(member).color === "red" ? "bg-red-600" : "bg-yellow-600"
                            }`}
                          >
                            {getMemberStatus(member).label}
                          </Badge>
                        </div>
                        
                        {/* Dates */}
                        <div className="flex flex-wrap items-center lg:justify-end gap-2">
                          <Badge variant="outline" className="text-xs">
                            Start: {new Date(member.startDate).toLocaleDateString()}
                          </Badge>
                          {member.endDate && (
                            <Badge variant="outline" className="text-xs">
                              End: {new Date(member.endDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Payment Information - Always visible */}
                        <div className="flex flex-wrap items-center lg:justify-end gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-green-100 text-green-800 border-green-300 text-xs font-semibold px-2 py-1"
                          >
                            💰 Paid: ₹{member.amountPaid || 0}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-semibold px-2 py-1 ${
                              (member.amountBalance || 0) > 0 
                                ? 'bg-red-100 text-red-800 border-red-300' 
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            {(member.amountBalance || 0) > 0 ? '⚠️' : '✅'} Balance: ₹{member.amountBalance !== undefined ? member.amountBalance : 0}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 flex-shrink-0 lg:ml-4">
                        <Link href={`/trainer/members/${member._id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <FaEye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/trainer/members/${member._id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <FaEdit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug Information - Remove this in production */}
        {process.env.NODE_ENV === 'development' && members.length > 0 && (
          <Card className="mt-4 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Info (Remove in Production)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700">
                Sample member data: {JSON.stringify(members[0], null, 2)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Note about permissions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> As a trainer, you can add new members and edit their subscription details. Only the
            Super Admin can delete members from the system.
          </p>
        </div>
      </div>
    </div>
  )
}