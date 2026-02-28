"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  contentId?: string;
  contentType?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      const defaultNotifications: Notification[] = [
        {
          id: "1",
          title: "Welcome to Watchdb HD",
          body: "Start watching your favorite movies and series",
          time: "Today"
        }
      ];
      setNotifications(defaultNotifications);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  return (
    <div className="relative lg:hidden">
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) fetchNotifications();
        }}
        className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 text-white" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[10px] flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-zinc-800">
            <span className="font-medium text-white">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-white">
                Clear all
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="p-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 hover:bg-white/5">
                  <p className="text-white font-medium text-sm">{notif.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{notif.body}</p>
                  <p className="text-gray-500 text-xs mt-2">{notif.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
