"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  contentId?: string;
  contentType?: string;
}

const NOTIFICATION_CHANNEL = "watchdb-notifications";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  const loadNotifications = useCallback(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
    } else {
      setNotifications([
        {
          id: "1",
          title: "Welcome to Watchdb HD",
          body: "Start watching your favorite movies and series",
          time: "Today"
        }
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "notifications" && e.newValue) {
        const newNotifs = JSON.parse(e.newValue);
        const latest = newNotifs[0];
        if (latest && notifications.length > 0 && latest.id !== notifications[0]?.id) {
          setNewNotification(latest);
          setTimeout(() => setNewNotification(null), 5000);
        }
        setNotifications(newNotifs);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newNotif = customEvent.detail as Notification;
      setNewNotification(newNotif);
      setTimeout(() => setNewNotification(null), 5000);
      loadNotifications();
    };

    window.addEventListener("watchdb-notification", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadNotifications, notifications]);

  useEffect(() => {
    if (newNotification) {
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  }, [newNotification]);

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  return (
    <>
      {newNotification && (
        <div className="fixed top-16 left-4 right-4 z-[100] animate-slide-down">
          <div className="bg-[#1a1a1a] border border-red-600 rounded-lg p-4 shadow-xl flex items-start gap-3">
            <Bell className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{newNotification.title}</p>
              <p className="text-gray-400 text-xs mt-1 truncate">{newNotification.body}</p>
            </div>
            <button onClick={() => setNewNotification(null)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative lg:hidden">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            if (!showNotifications) loadNotifications();
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
    </>
  );
}
