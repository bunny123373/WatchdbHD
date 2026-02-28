"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const defaultNotifications: Notification[] = [
        {
          id: "1",
          title: "New Movie Added",
          body: "New Telugu movies are now available!",
          time: "Just now"
        },
        {
          id: "2",
          title: "Welcome to Watchdb HD",
          body: "Start watching your favorite movies and series",
          time: "Today"
        }
      ];
      setNotifications(defaultNotifications);
      localStorage.setItem("notifications", JSON.stringify(defaultNotifications));
    }
  }, []);

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  return (
    <div className="relative lg:hidden">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
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
          
          {notifications.length === 0 ? (
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
