"use client";

import React, { useState, useEffect } from "react";
import { FaBell, FaSearch, FaTrash, FaCheck, FaUser, FaEdit, FaPlus, FaTimes } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Notification {
  _id: string;
  type: 'member_added' | 'member_updated' | 'member_deleted';
  message: string;
  trainerId: string;
  trainerName: string;
  memberId?: string;
  memberName?: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter and search logic
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = 
      notification.message.toLowerCase().includes(search.toLowerCase()) ||
      notification.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      (notification.memberName || "").toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter === "unread") matchesFilter = !notification.isRead;
    else if (filter === "read") matchesFilter = notification.isRead;
    
    return matchesSearch && matchesFilter;
  });

  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Get notification icon and color
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'member_added':
        return { icon: FaPlus, color: 'text-green-400', bgColor: 'bg-green-600' };
      case 'member_updated':
        return { icon: FaEdit, color: 'text-blue-400', bgColor: 'bg-blue-600' };
      case 'member_deleted':
        return { icon: FaTimes, color: 'text-red-400', bgColor: 'bg-red-600' };
      default:
        return { icon: FaBell, color: 'text-gray-400', bgColor: 'bg-gray-600' };
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'member_added':
        return 'Member Added';
      case 'member_updated':
        return 'Member Updated';
      case 'member_deleted':
        return 'Member Deleted';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaBell className="text-xl sm:text-2xl text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Track trainer activities and member management</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 text-sm sm:text-base h-10 sm:h-auto"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-yellow-500 focus:outline-none text-sm sm:text-base min-w-0 sm:min-w-48"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Clear All Read Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const readNotifications = notifications.filter(n => n.isRead);
                  readNotifications.forEach(n => handleDelete(n._id));
                }}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <FaTrash className="mr-1 sm:mr-2 text-xs" />
                <span className="hidden xs:inline">Clear Read</span>
                <span className="xs:hidden">Clear</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4 text-sm sm:text-base">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FaBell className="text-4xl sm:text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No notifications found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color, bgColor } = getNotificationIcon(notification.type);
              const typeLabel = getNotificationTypeLabel(notification.type);
              const date = new Date(notification.createdAt).toLocaleString();
              
              return (
                <Card key={notification._id} className={`bg-gray-800 border-gray-700 ${!notification.isRead ? 'border-l-4 border-l-yellow-500' : ''}`}>
                  <CardContent className="p-2 sm:p-6">
                    {/* Mobile Layout - Stacked */}
                    <div className="block sm:hidden">
                      {/* Header with icon, title, and badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="text-white text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-sm truncate">{typeLabel}</h3>
                            <Badge 
                              variant={notification.isRead ? "secondary" : "default"}
                              className={`text-xs flex-shrink-0 ${notification.isRead ? "bg-gray-600" : "bg-yellow-600"}`}
                            >
                              {notification.isRead ? "Read" : "New"}
                            </Badge>
                          </div>
                        </div>
                        {/* Actions on the right */}
                        <div className="flex gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white h-7 w-7 p-0 flex-shrink-0"
                            >
                              <FaCheck className="text-xs" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(notification._id)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-7 w-7 p-0 flex-shrink-0"
                          >
                            <FaTrash className="text-xs" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Message */}
                      <p className="text-gray-300 mb-2 text-sm leading-relaxed break-words">{notification.message}</p>
                      
                      {/* Details */}
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <FaUser className="text-xs flex-shrink-0" />
                          <span className="truncate">Trainer: {notification.trainerName}</span>
                        </div>
                        {notification.memberName && (
                          <div className="flex items-center gap-1">
                            <FaUser className="text-xs flex-shrink-0" />
                            <span className="truncate">Member: {notification.memberName}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{date}</div>
                      </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden sm:flex sm:items-start gap-4">
                      {/* Icon and Content Row */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="text-white text-lg" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-base">{typeLabel}</h3>
                            <Badge 
                              variant={notification.isRead ? "secondary" : "default"}
                              className={`text-xs ${notification.isRead ? "bg-gray-600" : "bg-yellow-600"}`}
                            >
                              {notification.isRead ? "Read" : "New"}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-300 mb-3 text-base leading-relaxed break-words">{notification.message}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1 min-w-0">
                              <FaUser className="text-xs flex-shrink-0" />
                              <span className="truncate">Trainer: {notification.trainerName}</span>
                            </div>
                            {notification.memberName && (
                              <div className="flex items-center gap-1 min-w-0">
                                <FaUser className="text-xs flex-shrink-0" />
                                <span className="truncate">Member: {notification.memberName}</span>
                              </div>
                            )}
                            <span className="text-xs whitespace-nowrap">{date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 self-start">
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white px-3 py-2"
                          >
                            <FaCheck className="text-xs" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(notification._id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-3 py-2"
                        >
                          <FaTrash className="text-xs" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}