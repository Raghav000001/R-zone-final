"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FaUsers, 
  FaUserTie, 
  FaChartLine, 
  FaBell, 
  FaPlus, 
  FaSignOutAlt,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaChartBar,
  FaRobot
} from "react-icons/fa";
import { MdOutlineCardMembership } from "react-icons/md";
import Link from "next/link";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTrainers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTrainers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Not authenticated, redirect to login
        window.location.href = '/admin/login';
        return;
      }
      
      // User is authenticated, fetch stats
      await fetchStats();
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Admin stats received:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear client-side cookies and redirect
      document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = '/admin/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-green-600 text-white">
                Super Admin
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Members
              </CardTitle>
              <FaUsers className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
              <p className="text-xs text-gray-400">
                All registered members
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Members
              </CardTitle>
              <MdOutlineCardMembership className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeMembers}</div>
              <p className="text-xs text-gray-400">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Revenue
              </CardTitle>
              <FaDollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Trainers
              </CardTitle>
              <FaUserTie className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTrainers}</div>
              <p className="text-xs text-gray-400">
                Active trainers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <FaPlus className="text-green-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/admin/members">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <FaUsers className="mr-2" />
                    View All Members
                  </Button>
                </Link>
                <Link href="/admin/trainers">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <FaUserTie className="mr-2" />
                    Manage Trainers
                  </Button>
                </Link>
                <Link href="/admin/notifications">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <FaBell className="mr-2" />
                    Notifications
                  </Button>
                </Link>
                <Link href="/ai-planner">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    <FaRobot className="mr-2" />
                    AI Wellness Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <FaChartLine className="text-blue-400" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Total Members</p>
                      <p className="text-xs text-gray-400">{stats.totalMembers} registered</p>
                    </div>
                  </div>
                  <span className="text-white font-semibold">{stats.totalMembers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Active Members</p>
                      <p className="text-xs text-gray-400">{stats.activeMembers} currently active</p>
                    </div>
                  </div>
                  <span className="text-white font-semibold">{stats.activeMembers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Total Revenue</p>
                      <p className="text-xs text-gray-400">₹{stats.totalRevenue.toLocaleString()} earned</p>
                    </div>
                  </div>
                  <span className="text-white font-semibold">₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FaCalendarAlt className="text-orange-400" />
                Membership Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Members</span>
                  <Badge className="bg-green-600 text-white">{stats.activeMembers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Expired Members</span>
                  <Badge className="bg-red-600 text-white">{stats.expiredMembers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monthly Revenue</span>
                  <span className="text-white font-semibold">₹{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FaUser className="text-purple-400" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Members</span>
                  <span className="text-white font-semibold">{stats.totalMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Trainers</span>
                  <span className="text-white font-semibold">{stats.totalTrainers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Revenue</span>
                  <span className="text-white font-semibold">₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
