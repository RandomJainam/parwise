"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Car, Edit2, Save, LogOut, ChevronRight, Bell, Shield, HelpCircle, Loader2 } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Profile { name: string; email: string; phone: string; vehiclePlate: string; }

export default function ProfilePage() {
  const router = useRouter();
  const { user, logOut, loading: authLoading } = useAuth();

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [profile, setProfile]   = useState<Profile>({ name: "", email: "", phone: "", vehiclePlate: "" });
  const [draft, setDraft]       = useState<Profile>(profile);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading, router]);

  // Load profile from Firestore
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as Profile;
        setProfile(data);
        setDraft(data);
      } else {
        const init = { name: user.displayName ?? "", email: user.email ?? "", phone: "", vehiclePlate: "" };
        setProfile(init); setDraft(init);
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { ...draft });
      setProfile(draft);
      setEditing(false);
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/auth");
    toast.success("Logged out");
  };

  if (authLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!user) return null;

  const fields = [
    { key: "name" as const,         label: "Full Name",     icon: User,  type: "text" },
    { key: "email" as const,        label: "Email",         icon: Mail,  type: "email" },
    { key: "phone" as const,        label: "Phone",         icon: Phone, type: "tel" },
    { key: "vehiclePlate" as const, label: "Vehicle Plate", icon: Car,   type: "text" },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-4">

        {/* Avatar card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-center shadow-md">
          <div className="w-20 h-20 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-3xl">
              {profile.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{profile.name || "User"}</h2>
          <p className="text-blue-200 text-sm">{profile.email}</p>
          {profile.vehiclePlate && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5">
              <Car className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-bold tracking-widest">{profile.vehiclePlate}</span>
            </div>
          )}
        </div>

        {/* Profile fields */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Personal Info</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-blue-600 text-sm font-bold">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { setDraft(profile); setEditing(false); }} className="text-gray-400 text-sm font-medium">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-blue-600 text-sm font-bold">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            )}
          </div>

          {fields.map(({ key, label, icon: Icon, type }) => (
            <div key={key} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                {editing ? (
                  <input
                    type={type}
                    value={draft[key]}
                    onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                    className="w-full text-sm font-semibold text-gray-900 border-b-2 border-blue-400 outline-none pb-0.5 bg-transparent"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile[key] || <span className="text-gray-300">Not set</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {[
            { icon: Bell,         label: "Notifications",     color: "text-blue-500",  bg: "bg-blue-50" },
            { icon: Shield,       label: "Privacy & Security", color: "text-green-500", bg: "bg-green-50" },
            { icon: HelpCircle,   label: "Help & Support",     color: "text-purple-500",bg: "bg-purple-50" },
          ].map(({ icon: Icon, label, color, bg }) => (
            <button key={label} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-800 text-left">{label}</span>
              <ChevronRight className="w-4 h-4 text-gray-200" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:bg-red-50 transition-colors"
        >
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-bold text-red-500">Sign Out</span>
        </button>

        <p className="text-center text-xs text-gray-300 pb-2">Smart Parking v1.0 • Mumbai</p>
      </div>
    </div>
  );
}
