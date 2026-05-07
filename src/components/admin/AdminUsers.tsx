"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Shield, ShieldOff, Trash2 } from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  provider?: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-key": sessionStorage.getItem("adminKey") || "" },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": sessionStorage.getItem("adminKey") || "",
        },
        body: JSON.stringify({ userId, isAdmin: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isAdmin: !current } : u))
        );
      }
    } catch (e) {
      console.error("Failed to toggle admin:", e);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": sessionStorage.getItem("adminKey") || "",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (e) {
      console.error("Failed to delete user:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Users ({users.length})</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4">Admin</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-white">{user.username}</td>
                <td className="py-3 px-4 text-gray-400">{user.email}</td>
                <td className="py-3 px-4 text-gray-400">{user.provider || "email"}</td>
                <td className="py-3 px-4">
                  {user.isAdmin ? (
                    <span className="text-green-400 text-xs font-medium">Admin</span>
                  ) : (
                    <span className="text-gray-500 text-xs">User</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAdmin(user._id, user.isAdmin)}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      title={user.isAdmin ? "Remove admin" : "Make admin"}
                    >
                      {user.isAdmin ? (
                        <ShieldOff className="w-4 h-4 text-red-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
