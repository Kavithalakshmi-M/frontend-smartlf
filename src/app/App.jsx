import React, { useState, useRef, useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { updateProfileApi, changePasswordApi, getUserProfileApi, getAllUsersApi, deleteUserApi, registerApi } from "../api/auth";
import {
  createLostItemApi,
  getLostItemsApi,
  getMyLostItemsApi,
  updateLostItemStatusApi,
  deleteLostItemApi,
  createFoundItemApi,
  getFoundItemsApi,
  getMyFoundItemsApi,
  updateFoundItemStatusApi,
  deleteFoundItemApi,
  getImageUrl,
  formatDateForUI
} from "../api/items";
import {
  getMatchesForUserApi,
  getMatchesByLostItemApi,
  getMatchesByFoundItemApi,
  updateMatchStatusApi,
  triggerMatchRescanApi
} from "../api/matches";
import {
  submitClaimApi,
  getClaimByIdApi,
  getMyClaimsApi,
  getAllClaimsApi,
  reviewClaimApi
} from "../api/claims";
import {
  getNotificationsApi,
  markNotificationReadApi,
  getUnreadCountApi,
  createNotificationApi
} from "../api/notifications";
import {
  getStaffDashboardApi,
  getAdminDashboardApi,
  getAnalyticsApi
} from "../api/dashboard";
import {
  getStationsApi,
  createStationApi,
  updateStationApi,
  deleteStationApi
} from "../api/stations";
import {
  Train, Search, Bell, User, Home, FileText, Package, Cpu, ClipboardList, LogOut,
  X, ChevronRight, MapPin, Calendar, Clock, Upload, CheckCircle, AlertCircle,
  TrendingUp, Users, Shield, Zap, Globe, ArrowRight, Star, Mail, Phone, Lock,
  Eye, EyeOff, BarChart2, Settings, Activity, Tag, Camera, Filter, Download,
  Edit2, Trash2, ChevronDown, RefreshCw, Check, Info, AlertTriangle, Inbox,
  Building, Map as MapIcon, Plus, CheckSquare, XCircle, Sliders, ExternalLink, HelpCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Toaster, toast } from "sonner";

// ─── Initial Mock Data ──────────────────────────────────────────────────────────
const INITIAL_CATEGORIES = ["Luggage", "Electronics", "Wallet", "Keys", "Clothing", "Documents", "Jewelry", "Other"];
const INITIAL_STATIONS = [
  "New Delhi Railway Station", "CSMT Mumbai", "Howrah Junction", "Chennai Central",
  "Bengaluru City", "Hyderabad Bus Terminal", "Pune Station", "Ahmedabad Junction"
];

const INITIAL_MONTHLY_DATA = [];
const INITIAL_CATEGORY_DATA = [];
const INITIAL_AI_MATCHES = [];
const INITIAL_NOTIFICATIONS = [];
const INITIAL_LOST_ITEMS = [];
const INITIAL_FOUND_ITEMS = [];
const INITIAL_ADMIN_USERS = [];
const INITIAL_CLAIMS = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const confidenceColor = (score) =>
  score >= 90 ? "bg-green-100 text-green-700 border border-green-200" :
  score >= 80 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
  "bg-red-100 text-red-700 border border-red-200";

const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "matched": case "approved": case "active": case "available":
      return "bg-green-100 text-green-700";
    case "searching": case "verification": case "under verification":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "closed": case "inactive": case "claimed": case "disposed":
      return "bg-gray-100 text-gray-600";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ─── Navigation & Layout Components ───────────────────────────────────────────
function UserSidebar({ current, navigate, onLogout }) {
  const items = [
    { icon: Home, label: "Dashboard", page: "user-dashboard" },
    { icon: FileText, label: "Report Lost", page: "user-report-lost" },
    { icon: Package, label: "Report Found", page: "user-report-found" },
    { icon: Cpu, label: "AI Matches", page: "user-ai-matches" },
    { icon: ClipboardList, label: "My Reports", page: "user-my-reports" },
    { icon: Bell, label: "Notifications", page: "user-notifications" },
    { icon: User, label: "Profile", page: "user-profile" }
  ];
  return (
    <aside className="w-60 bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("user-dashboard")}>
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <Train size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#2563EB] tracking-wide uppercase">Smart L&F</p>
            <p className="text-[10px] text-[#6B7280]">User Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ icon: Icon, label, page }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#2563EB]" : ""} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#E5E7EB]">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function StaffSidebar({ current, navigate, onLogout }) {
  const items = [
    { icon: Home, label: "Dashboard", page: "staff-dashboard" },
    { icon: Package, label: "Register Found Item", page: "staff-register" },
    { icon: ClipboardList, label: "Manage Found Items", page: "staff-manage" },
    { icon: Shield, label: "Pending Claims", page: "staff-claims" },
    { icon: Cpu, label: "AI Matches", page: "staff-ai" },
    { icon: Bell, label: "Notifications", page: "user-notifications" },
    { icon: User, label: "Profile", page: "user-profile" }
  ];
  return (
    <aside className="w-60 bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("staff-dashboard")}>
          <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center">
            <Train size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#16A34A] tracking-wide uppercase">Smart L&F</p>
            <p className="text-[10px] text-[#6B7280]">Staff Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ icon: Icon, label, page }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-[#F0FDF4] text-[#16A34A]" : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#16A34A]" : ""} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#E5E7EB]">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function AdminSidebar({ current, navigate, onLogout }) {
  const items = [
    { icon: Home, label: "Dashboard", page: "admin-dashboard" },
    { icon: FileText, label: "Lost Items", page: "admin-lost" },
    { icon: Package, label: "Found Items", page: "admin-found" },
    { icon: Cpu, label: "AI Match Review", page: "admin-ai" },
    { icon: Shield, label: "Claim Requests", page: "admin-claims" },
    { icon: Users, label: "Users", page: "admin-users" },
    { icon: Building, label: "Stations", page: "admin-stations" },
    { icon: Settings, label: "Settings", page: "admin-settings" }
  ];
  return (
    <aside className="w-60 bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("admin-dashboard")}>
          <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
            <Train size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#7C3AED] tracking-wide uppercase">Smart L&F</p>
            <p className="text-[10px] text-[#6B7280]">Admin Console</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ icon: Icon, label, page }) => {
          const active = current === page;
          return (
            <button
              key={`${page}-${label}`}
              onClick={() => navigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-[#F5F3FF] text-[#7C3AED]" : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#7C3AED]" : ""} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#E5E7EB]">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, subtitle, role, navigate, notifications, globalSearch, setGlobalSearch }) {
  const [showBellMenu, setShowBellMenu] = useState(false);
  const { user } = useAuth();
  const avatarColor = role === "admin" ? "bg-[#7C3AED]" : role === "staff" ? "bg-[#16A34A]" : "bg-[#2563EB]";
  const name = user?.name || "User Account";
  const initials = (user?.name || "User").split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "U";
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0 relative z-30">
      <div>
        <h1 className="text-base font-semibold text-[#111827]">{title}</h1>
        {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search items, stations, claims…"
            className="w-64 pl-9 pr-4 py-2 text-sm border border-[#D1D5DB] rounded-xl bg-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          {globalSearch && (
            <button onClick={() => setGlobalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBellMenu(!showBellMenu)}
            className="relative p-2 rounded-xl text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
            )}
          </button>

          {showBellMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                <h4 className="text-sm font-semibold text-[#111827]">Notifications</h4>
                <button
                  onClick={() => {
                    navigate("user-notifications");
                    setShowBellMenu(false);
                  }}
                  className="text-xs text-[#2563EB] font-medium hover:underline"
                >
                  View all ({notifications.length})
                </button>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => { navigate("user-notifications"); setShowBellMenu(false); }}>
                    <p className="text-xs font-semibold text-[#111827]">{n.title}</p>
                    <p className="text-xs text-[#6B7280] truncate mt-0.5">{n.body}</p>
                    <span className="text-[10px] text-[#9CA3AF] mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger */}
        <div
          onClick={() => navigate("user-profile")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
          title="View Profile"
        >
          <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold`}>
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#111827] leading-none">{name}</p>
            <p className="text-xs text-[#6B7280] capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon: Icon, label, value, delta, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280] font-medium">{label}</p>
          <p className="text-2xl font-bold text-[#111827] mt-1">{value}</p>
          {delta && <p className="text-xs text-[#16A34A] mt-1 font-medium">{delta}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ navigate, openModal }) {
  const features = [
    { icon: Cpu, title: "AI Image Matching", desc: "Advanced computer vision identifies your lost item across all registered found items with up to 97% accuracy." },
    { icon: Shield, title: "Secure Claim Verification", desc: "Multi-step ownership verification ensures your belongings reach the right person." },
    { icon: Activity, title: "Real-Time Tracking", desc: "Track your claim status from submission to collection, with live notifications at every step." },
    { icon: Globe, title: "Multi-Station Support", desc: "Unified platform covering hundreds of railway stations and bus terminals nationwide." },
    { icon: Zap, title: "Fast Recovery", desc: "Average item recovery time reduced from 14 days to under 48 hours with our AI-powered system." },
    { icon: Bell, title: "Smart Notifications", desc: "Instant alerts via email, SMS, and in-app push when a potential match is found." }
  ];

  const scrollToFeatures = (e) => {
    e?.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Train size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#111827] text-base">Smart L&F</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-sm text-[#6B7280] hover:text-[#2563EB] font-medium transition-colors">Home</button>
            <button onClick={scrollToFeatures} className="text-sm text-[#6B7280] hover:text-[#2563EB] font-medium transition-colors">Features</button>
            <button onClick={() => openModal("about")} className="text-sm text-[#6B7280] hover:text-[#2563EB] font-medium transition-colors">About</button>
            <button onClick={() => openModal("contact")} className="text-sm text-[#6B7280] hover:text-[#2563EB] font-medium transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("login")} className="text-sm font-semibold text-[#2563EB] px-4 py-2 rounded-xl border border-[#2563EB] hover:bg-[#EFF6FF] transition-colors">Login</button>
            <button onClick={() => navigate("login", null, true)} className="text-sm font-semibold text-white px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors">Register</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Cpu size={12} />
              AI-Powered Platform
            </div>
            <h1 className="text-5xl font-extrabold text-[#111827] leading-tight mb-5">
              Smart Lost &amp; Found<br />
              <span className="text-[#2563EB]">Management System</span>
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-xl">
              AI-powered platform helping passengers reunite with their belongings quickly and securely. Covering 200+ stations nationwide.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("login")} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-200">
                Get Started <ArrowRight size={16} />
              </button>
              <button onClick={scrollToFeatures} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] font-medium px-4 py-3 transition-colors">
                Learn More <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-8 mt-10">
              {[["98K+", "Items Returned"], ["200+", "Stations"], ["94%", "Match Accuracy"]].map(([v, l]) => (
                <div key={l} className="cursor-pointer" onClick={() => openModal("about")}>
                  <p className="text-2xl font-bold text-[#111827]">{v}</p>
                  <p className="text-xs text-[#6B7280] font-medium">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=700&h=500&fit=crop&auto=format" alt="Railway station" className="w-full h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2563EB]/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur rounded-2xl p-4 flex items-center gap-4 shadow-lg cursor-pointer" onClick={() => navigate("login")}>
                  <div className="w-10 h-10 bg-[#16A34A] rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">AI Match Found! 94% Confidence</p>
                    <p className="text-xs text-[#6B7280]">Black Samsonite Trolley — New Delhi Station</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-lg cursor-pointer" onClick={() => navigate("login")}>
              <p className="text-xs text-[#6B7280] font-medium">Today&apos;s Matches</p>
              <p className="text-2xl font-bold text-[#2563EB]">127</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#2563EB] text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-bold text-[#111827]">Everything you need to recover lost items</h2>
            <p className="text-[#6B7280] mt-3 text-lg max-w-2xl mx-auto">A complete end-to-end platform built for passengers, station staff, and administrators.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} onClick={() => openModal("about")} className="group p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#2563EB] hover:shadow-lg transition-all cursor-pointer">
                <div className="w-11 h-11 bg-[#EFF6FF] group-hover:bg-[#2563EB] rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon size={20} className="text-[#2563EB] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#111827] mb-2">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Lost something? We can help.</h2>
            <p className="text-blue-200 mb-8 text-lg">Join 500,000+ passengers who trust Smart L&F to recover their belongings.</p>
            <button onClick={() => navigate("login")} className="bg-white text-[#2563EB] font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Report Lost Item
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
                  <Train size={13} className="text-white" />
                </div>
                <span className="font-bold text-sm">Smart L&F</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">AI-powered lost and found management for modern transportation networks.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Platform</p>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("login", "user")} className="text-gray-400 text-sm hover:text-white transition-colors">Passenger Portal</button></li>
                <li><button onClick={() => navigate("login", "staff")} className="text-gray-400 text-sm hover:text-white transition-colors">Staff Portal</button></li>
                <li><button onClick={() => navigate("login", "admin")} className="text-gray-400 text-sm hover:text-white transition-colors">Admin Dashboard</button></li>
                <li><button onClick={() => openModal("about")} className="text-gray-400 text-sm hover:text-white transition-colors">API Docs</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Company</p>
              <ul className="space-y-2">
                <li><button onClick={() => openModal("about")} className="text-gray-400 text-sm hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => openModal("about")} className="text-gray-400 text-sm hover:text-white transition-colors">Blog</button></li>
                <li><button onClick={() => openModal("about")} className="text-gray-400 text-sm hover:text-white transition-colors">Careers</button></li>
                <li><button onClick={() => openModal("about")} className="text-gray-400 text-sm hover:text-white transition-colors">Press</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Contact</p>
              <ul className="space-y-2">
                <li><button onClick={() => openModal("contact")} className="text-gray-400 text-sm hover:text-white transition-colors">support@smartlf.in</button></li>
                <li><button onClick={() => openModal("contact")} className="text-gray-400 text-sm hover:text-white transition-colors">+91 1800 123 456</button></li>
                <li><span className="text-gray-400 text-sm">New Delhi, India</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© 2026 Smart Lost & Found Management System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => openModal("about")} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Privacy Policy</button>
              <button onClick={() => openModal("about")} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Terms of Service</button>
              <button onClick={() => openModal("about")} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── LOGIN & REGISTER PAGE ───────────────────────────────────────────────────
function LoginPage({ navigate, openModal, initialRegister = false }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const normRole = await login(email, password);
      toast.success("Welcome back!");
      if (normRole === "admin") {
        navigate("admin-dashboard", "admin");
      } else if (normRole === "staff") {
        navigate("staff-dashboard", "staff");
      } else {
        navigate("user-dashboard", "user");
      }
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg = err.response?.data?.message || (typeof err.response?.data === "string" ? err.response?.data : null);
      toast.error(serverMsg || "Invalid credentials or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone, password });
      toast.success("Account created successfully! Please sign in with your credentials.");
      setIsRegister(false);
      setPassword("");
    } catch (err) {
      console.error("Registration error:", err);
      const detailsMap = err.response?.data?.details;
      let detailMsg = null;
      if (detailsMap && typeof detailsMap === "object") {
        detailMsg = Object.values(detailsMap).filter(Boolean).join(". ");
      }
      const serverMsg = detailMsg || err.response?.data?.message || (typeof err.response?.data === "string" ? err.response?.data : null);
      toast.error(serverMsg || "Registration failed. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-[Inter,sans-serif]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-40 right-10 w-60 h-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center gap-3 cursor-pointer" onClick={() => navigate("landing")}>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Train size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Smart L&F</span>
        </div>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop&auto=format" alt="Station" className="rounded-2xl shadow-2xl mb-8 w-full object-cover h-64" />
          <h2 className="text-3xl font-bold text-white mb-3">Reunite with your belongings</h2>
          <p className="text-blue-200 leading-relaxed">Our AI-powered system has helped over 98,000 passengers recover lost items across 200+ stations.</p>
          <div className="flex items-center gap-3 mt-6">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            <span className="text-blue-200 text-sm ml-1">4.9/5 from 12,000+ users</span>
          </div>
        </div>
        <div className="relative">
          <p className="text-blue-200 text-xs">© 2026 Smart Lost & Found. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate("landing")}>
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Train size={15} className="text-white" />
            </div>
            <span className="font-bold text-[#111827]">Smart L&F</span>
          </div>

          <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isRegister ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isRegister ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"}`}
            >
              Create Account
            </button>
          </div>

          {!isRegister ? (
            <>
              <h1 className="text-2xl font-bold text-[#111827] mb-2">Welcome back</h1>
              <p className="text-[#6B7280] mb-6">Sign in to access your portal</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
                    />
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-11 py-3 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
                    />
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <button type="button" onClick={() => openModal("forgotPassword")} className="text-xs text-[#2563EB] hover:underline">Forgot password?</button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <><RefreshCw size={15} className="animate-spin" /> Signing in…</> : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#111827] mb-2">Create an account</h1>
              <p className="text-[#6B7280] mb-6">Register to track lost items and submit claims</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <><RefreshCw size={15} className="animate-spin" /> Creating Account…</> : "Register Account"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[#6B7280] mt-6">
            {!isRegister ? (
              <>Don&apos;t have an account? <button onClick={() => setIsRegister(true)} className="text-[#2563EB] font-semibold hover:underline cursor-pointer">Create Account</button></>
            ) : (
              <>Already have an account? <button onClick={() => setIsRegister(false)} className="text-[#2563EB] font-semibold hover:underline cursor-pointer">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDashboard({ navigate, lostItems, myLostItems = [], foundItems = [], aiMatches, setSelectedMatch }) {
  const displayLost = myLostItems.length > 0 ? myLostItems : [];

  return (
    <div className="p-6 space-y-6 font-[Inter,sans-serif]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard onClick={() => navigate("user-my-reports")} icon={FileText} label="Lost Reports" value={displayLost.length.toString()} delta="Active" color="bg-[#2563EB]" />
        <StatCard onClick={() => navigate("user-ai-matches")} icon={Package} label="System Vault" value={(foundItems || []).length.toString()} color="bg-[#16A34A]" />
        <StatCard onClick={() => navigate("user-ai-matches")} icon={Cpu} label="AI Matches" value={aiMatches.length.toString()} delta="94% best match" color="bg-[#7C3AED]" />
        <StatCard onClick={() => navigate("user-my-reports")} icon={CheckCircle} label="Claim Status" value="Active" color="bg-[#CA8A04]" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h2 className="font-semibold text-[#111827] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Report Lost Item", icon: FileText, page: "user-report-lost", color: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white" },
            { label: "Report Found Item", icon: Package, page: "user-report-found", color: "bg-[#16A34A] hover:bg-[#15803D] text-white" },
            { label: "Search Items", icon: Search, page: "user-ai-matches", color: "bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#111827] border border-[#D1D5DB]" }
          ].map(({ label, icon: Icon, page, color }) => (
            <button key={label} onClick={() => navigate(page)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${color}`}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Matches Preview */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#111827]">Recent AI Matches</h2>
            <p className="text-xs text-[#6B7280]">AI-driven similarity matches linking your reported lost items with vault inventory</p>
          </div>
          <button onClick={() => navigate("user-ai-matches")} className="text-xs text-[#2563EB] hover:underline font-semibold">
            View All Matches ({aiMatches.length})
          </button>
        </div>

        <div className="space-y-4">
          {aiMatches.length === 0 ? (
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] p-8 text-center">
              <Cpu size={28} className="text-[#9CA3AF] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#111827]">No AI matches yet.</p>
              <p className="text-xs text-[#6B7280] mt-1 max-w-md mx-auto">
                AI matches appear automatically when our system finds a potential match between your reported lost item and a registered found item.
              </p>
            </div>
          ) : (
            aiMatches.slice(0, 3).map((m) => (
              <div key={m.id} className="border border-[#E5E7EB] rounded-2xl p-4 bg-white hover:border-[#DBEAFE] hover:bg-[#F8FAFC] transition-all space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-[#2563EB]" />
                    <span className="text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      AI Similarity Match #{m.id}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${confidenceColor(m.score)}`}>
                    {m.score}% Similarity
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left: User's Lost Item */}
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Your Lost Item</p>
                    <p className="text-sm font-bold text-[#111827] mt-0.5">{m.lostItemName || m.lostItem}</p>
                    <p className="text-xs text-[#4B5563] mt-1 line-clamp-1">{m.lostItemDescription || "No lost item notes"}</p>
                  </div>

                  {/* Right: Matched Found Item */}
                  <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#DCFCE7]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#15803D]">Matched Found Item</p>
                    <p className="text-sm font-bold text-[#111827] mt-0.5">{m.foundItemName || m.foundItem}</p>
                    <p className="text-xs text-[#4B5563] mt-1 line-clamp-1">{m.foundItemDescription || "No description provided."}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-[#6B7280] flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span><strong className="text-[#374151]">Found at:</strong> {m.station}</span>
                    <span><strong className="text-[#374151]">Date:</strong> {m.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMatch(m);
                        navigate("user-match-detail");
                      }}
                      className="px-3 py-1.5 border border-[#D1D5DB] text-[#4B5563] text-xs font-medium rounded-lg hover:bg-white transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        if (setSelectedMatch) setSelectedMatch(m);
                        navigate("user-claim-verify");
                      }}
                      className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Shield size={14} /> Claim This Item
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Reports */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#111827]">My Reports</h2>
          <button onClick={() => navigate("user-my-reports")} className="text-xs text-[#2563EB] hover:underline font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          {displayLost.length === 0 ? (
            <div className="text-center py-6 text-[#6B7280]">
              <p className="text-xs">You have not reported any lost items yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {["Item", "Category", "Station", "Date", "Status", "AI Match"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#6B7280] pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {displayLost.slice(0, 4).map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 pr-4 font-medium text-[#111827]">{item.item || item.title}</td>
                    <td className="py-3 pr-4 text-[#6B7280]">{item.category}</td>
                    <td className="py-3 pr-4 text-[#6B7280]">{item.station || item.location}</td>
                    <td className="py-3 pr-4 text-[#6B7280]">{item.date}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="py-3">
                      {item.match ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceColor(item.match)}`}>{item.match}%</span>
                      ) : (
                        <span className="text-[#9CA3AF] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REPORT LOST PAGE ─────────────────────────────────────────────────────────
function ReportLostPage({ navigate, addLostItem }) {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    item: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    station: "",
    desc: ""
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success(`Selected image: ${file.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.category || !formData.station || !formData.date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const requestData = {
        title: formData.item,
        category: formData.category,
        dateLost: formData.date,
        locationLost: formData.station,
        description: formData.desc || formData.item,
        file: imageFile
      };
      const createdItem = await createLostItemApi(requestData);
      addLostItem(createdItem);
      toast.success("Lost Item Report registered successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to report lost item:", err);
      toast.error(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] font-[Inter,sans-serif]">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center max-w-md w-full animate-in zoom-in-95">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Report Submitted!</h2>
          <p className="text-[#6B7280] mb-6">Your lost item report has been registered. AI matching is running in the background.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate("user-ai-matches")} className="flex-1 bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8] transition-colors">View AI Matches</button>
            <button onClick={() => { setSubmitted(false); setImageFile(null); setImagePreview(null); }} className="flex-1 border border-[#D1D5DB] text-[#6B7280] font-medium py-2.5 rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors">New Report</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#111827]">Report a Lost Item</h2>
          <p className="text-sm text-[#6B7280]">Fill in the details below. AI matching will run automatically.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Item Name *</label>
              <input required value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} placeholder="e.g. Black Trolley Bag" className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Category *</label>
              <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all">
                <option value="">Select category</option>
                {INITIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Lost Date *</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Lost Time</label>
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Station / Bus Stand *</label>
            <select required value={formData.station} onChange={(e) => setFormData({ ...formData, station: e.target.value })} className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all">
              <option value="">Select location</option>
              {INITIAL_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Item Description</label>
            <textarea rows={3} value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} placeholder="Describe the item in detail" className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Upload Images</label>
            <label className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center hover:border-[#2563EB] transition-colors cursor-pointer block relative">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover mb-2" />
                  <span className="text-xs text-[#2563EB] font-medium">Click to change photo</span>
                </div>
              ) : (
                <><Upload size={24} className="text-[#9CA3AF] mx-auto mb-2" /><p className="text-sm text-[#6B7280]">Drop images here or browse</p></>
              )}
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={15} className="animate-spin" /> Submitting…</> : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── REPORT FOUND PAGE ────────────────────────────────────────────────────────
function ReportFoundPage({ addFoundItem }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    station: "",
    location: "Waiting Room",
    desc: ""
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success(`Photo selected: ${file.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const requestData = {
        title: formData.name,
        category: formData.category,
        dateFound: formData.date,
        locationFound: formData.station || formData.location || "Station",
        description: formData.desc || formData.name,
        file: imageFile
      };
      const createdItem = await createFoundItemApi(requestData);
      addFoundItem(createdItem);
      toast.success("Found item logged successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to report found item:", err);
      const serverMsg = err.response?.data?.message || "Failed to register found item. Please check input parameters.";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] font-[Inter,sans-serif]">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center max-w-md w-full animate-in zoom-in-95">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Item Registered!</h2>
          <p className="text-[#6B7280] mb-6">The found item has been registered and will appear in the system for owner matching.</p>
          <button onClick={() => { setSubmitted(false); setImageFile(null); setImagePreview(null); }} className="bg-[#16A34A] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-[#15803D] transition-colors">Register Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#111827]">Report a Found Item</h2>
          <p className="text-sm text-[#6B7280]">Help reunite this item with its owner.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Item Name *</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Brown Leather Wallet"
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] bg-white transition-all"
              >
                <option value="">Select category</option>
                {INITIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Found Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Found Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Found Location *</label>
            <select
              required
              value={formData.station}
              onChange={(e) => setFormData({ ...formData, station: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] bg-white transition-all"
            >
              <option value="">Select station</option>
              {INITIAL_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Describe exactly what you found…"
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] bg-white transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Upload Images</label>
            <label className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center hover:border-[#16A34A] transition-colors cursor-pointer block">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img src={imagePreview} alt="Found Item" className="w-24 h-24 rounded-lg object-cover mb-2" />
                  <span className="text-xs text-[#16A34A] font-medium">Click to replace photo</span>
                </div>
              ) : (
                <>
                  <Camera size={24} className="text-[#9CA3AF] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">Add photos of the found item</p>
                </>
              )}
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={15} className="animate-spin" /> Registering…</> : "Register Found Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── AI MATCHES & SYSTEM VAULT PAGE ──────────────────────────────────────────
function AIMatchesPage({ navigate, aiMatches = [], foundItems = [], setSelectedMatch, dismissMatch, role, globalSearch = "" }) {
  const [activeTab, setActiveTab] = useState("vault");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterConf, setFilterConf] = useState("all");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getMatchesForUserApi();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load user matches:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const safeFoundItems = Array.isArray(foundItems) ? foundItems : [];

  const enrichMatch = (m) => {
    if (!m) return null;
    const foundObj = safeFoundItems.find(i => String(i.id) === String(m.foundItemId));

    const lName = m.lostItemName || m.lostItem || `Lost Item #${m.lostItemId}`;
    const fName = m.foundItemName || m.foundItem || foundObj?.title || foundObj?.name || foundObj?.item || `Found Item #${m.foundItemId}`;
    const lDesc = m.lostItemDescription || "No lost item notes provided.";
    const fDesc = m.foundItemDescription || foundObj?.description || foundObj?.desc || "No description provided.";
    const lCategory = m.lostItemCategory || "General";
    const fCategory = m.foundItemCategory || foundObj?.category || "General";
    const lLocation = m.lostItemLocation || "Reported Location";
    const fStation = m.foundItemStation || m.station || foundObj?.location || foundObj?.station || "Station Vault";

    // Explicitly resolve Lost Item Image (always belongs to lostItemId) vs Found Item Image (always belongs to foundItemId)
    const lImg = m.lostItemImg || (m.lostItemId ? getImageUrl(`/api/items/images/${m.lostItemId}`) : null);
    const fImg = m.foundItemImg || m.img || m.imageUrl || foundObj?.img || foundObj?.imageUrl || (m.foundItemId ? getImageUrl(`/api/items/images/${m.foundItemId}`) : null);

    const lReporter = m.lostItemReporter || (m.reportedBy ? `Passenger #${m.reportedBy}` : "Passenger");
    const fReporter = m.foundItemReporter || (foundObj?.reportedBy ? `Staff #${foundObj.reportedBy}` : "Station Staff");

    const rawScore = m.score != null ? m.score : (m.similarityScore != null ? (m.similarityScore <= 1 ? Math.round(m.similarityScore * 100) : Math.round(m.similarityScore)) : 85);
    let confidence = "low";
    if (rawScore >= 90) confidence = "high";
    else if (rawScore >= 80) confidence = "medium";

    return {
      ...m,
      id: m.id,
      lostItemId: m.lostItemId,
      foundItemId: m.foundItemId,
      lostItem: lName,
      lostItemName: lName,
      lostItemDescription: lDesc,
      lostItemCategory: lCategory,
      lostItemLocation: lLocation,
      lostItemImg: lImg,
      lostItemReporter: lReporter,
      foundItem: fName,
      foundItemName: fName,
      foundItemDescription: fDesc,
      foundItemCategory: fCategory,
      foundItemStation: fStation,
      foundItemImg: fImg,
      foundItemReporter: fReporter,
      station: fStation,
      img: fImg,
      imageUrl: fImg,
      score: rawScore,
      confidence: confidence,
      date: formatDateForUI(m.createdAt || new Date().toISOString()),
      createdAt: m.createdAt,
      rawStatus: m.status || "PENDING",
    };
  };

  const rawDisplayMatches = (matches && matches.length > 0) ? matches : (aiMatches || []);
  const enrichedMatches = rawDisplayMatches.map(enrichMatch).filter(Boolean);

  // Deduplicate AI matches by relationship pair (lostItemId + "_" + foundItemId)
  const uniqueMatchesMap = new Map();
  enrichedMatches.forEach((m) => {
    if (!m || !m.lostItemId || !m.foundItemId) return;
    const pairKey = `${m.lostItemId}_${m.foundItemId}`;
    if (!uniqueMatchesMap.has(pairKey)) {
      uniqueMatchesMap.set(pairKey, m);
    }
  });
  const displayMatches = Array.from(uniqueMatchesMap.values());

  const filteredMatches = displayMatches.filter((m) => {
    if (!m) return false;
    const q = (search || globalSearch || "").toLowerCase();
    const matchQuery = (m.lostItem || m.lostItemName || "").toLowerCase().includes(q) ||
                       (m.foundItem || m.foundItemName || "").toLowerCase().includes(q) ||
                       (m.station || m.foundItemStation || "").toLowerCase().includes(q) ||
                       (m.lostItemCategory || m.foundItemCategory || "").toLowerCase().includes(q);
    const matchConf = filterConf === "all" ? true : String(m.confidence || "").toLowerCase() === filterConf.toLowerCase();
    return matchQuery && matchConf;
  });

  const uniqueFoundItems = Array.from(new Map(safeFoundItems.map((item) => [item?.id || Math.random(), item])).values());

  const filteredFoundItems = uniqueFoundItems.filter((item) => {
    if (!item) return false;
    const q = (search || globalSearch || "").toLowerCase();
    return (item.title || item.name || item.item || "").toLowerCase().includes(q) ||
           (item.category || "").toLowerCase().includes(q) ||
           (item.location || item.station || "").toLowerCase().includes(q) ||
           (item.description || item.desc || "").toLowerCase().includes(q);
  });

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      const newMatches = await triggerMatchRescanApi();
      if (newMatches && Array.isArray(newMatches)) {
        setMatches(newMatches);
      } else {
        await fetchMatches();
      }
      toast.success("AI Rescan completed across system!");
    } catch (err) {
      console.error("Rescan failed:", err);
      toast.error(err.response?.data?.message || "Failed to complete AI rescan");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAcceptMatch = async (match) => {
    try {
      await updateMatchStatusApi(match.id, "CONFIRMED");
      toast.success(`Match #${match.id} CONFIRMED! Lost item linked with Found item.`);
      setMatches(prev => prev.filter(item => item.id !== match.id && `${item.lostItemId}_${item.foundItemId}` !== `${match.lostItemId}_${match.foundItemId}`));
      if (dismissMatch) dismissMatch(match.id, "CONFIRMED");
    } catch (err) {
      toast.error("Failed to confirm match");
    }
  };

  const handleRejectMatch = async (match) => {
    try {
      await updateMatchStatusApi(match.id, "REJECTED");
      toast.info(`Match #${match.id} rejected.`);
      setMatches(prev => prev.filter(item => item.id !== match.id && `${item.lostItemId}_${item.foundItemId}` !== `${match.lostItemId}_${match.foundItemId}`));
      if (dismissMatch) dismissMatch(match.id, "REJECTED");
    } catch (err) {
      toast.error("Failed to reject match");
    }
  };

  return (
    <div className="p-6 space-y-6 font-[Inter,sans-serif]">
      {/* Header Banner */}
      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center shrink-0">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1D4ED8]">System Vault &amp; Found Items Repository</p>
            <p className="text-xs text-[#2563EB]">Search all registered found items in the vault to identify and claim your missing belongings.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("vault")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === "vault" ? "bg-[#2563EB] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}
          >
            System Vault ({foundItems.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === "ai" ? "bg-[#7C3AED] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}
          >
            AI Matches ({displayMatches.length})
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-semibold text-[#111827]">
          {activeTab === "vault" ? "System Vault Repository" : "AI Match Results"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "vault" ? "Search found items in vault…" : "Search AI matches…"}
              className="pl-8 pr-3 py-1.5 text-xs border border-[#D1D5DB] rounded-lg outline-none focus:border-[#2563EB] w-56"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          </div>

          {activeTab === "ai" && (
            <>
              <select
                value={filterConf}
                onChange={(e) => setFilterConf(e.target.value)}
                className="px-3 py-1.5 text-xs border border-[#D1D5DB] rounded-lg text-[#6B7280] bg-white outline-none"
              >
                <option value="all">All Confidence</option>
                <option value="high">High Confidence (90%+)</option>
                <option value="medium">Medium Confidence (80%+)</option>
                <option value="low">Low Confidence (&lt;80%)</option>
              </select>

              <button
                onClick={handleRescan}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#D1D5DB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
              >
                <RefreshCw size={12} className={isScanning ? "animate-spin" : ""} />
                {isScanning ? "Scanning…" : "Rescan"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* SYSTEM VAULT REPOSITORY TAB */}
      {activeTab === "vault" && (
        <div>
          {filteredFoundItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
              <Package size={32} className="text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-[#111827] font-semibold text-base">No items found in System Vault</p>
              <p className="text-xs text-[#6B7280] mt-1">Try adjusting your search terms or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoundItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    {item.img || item.imageUrl ? (
                      <img src={item.img || item.imageUrl} alt={item.title} className="w-full h-36 object-cover rounded-xl mb-3 bg-[#F3F4F6]" />
                    ) : (
                      <div className="w-full h-36 bg-[#F8FAFC] border border-dashed border-[#E5E7EB] rounded-xl mb-3 flex items-center justify-center text-[#9CA3AF]">
                        <Package size={28} />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#111827] text-sm truncate">{item.title || item.name || item.item}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{item.description || item.desc || "Item registered in station vault."}</p>
                    <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-3 flex-wrap">
                      <div className="flex items-center gap-1"><MapPin size={12} /> {item.location || item.station}</div>
                      <div className="flex items-center gap-1"><Calendar size={12} /> {item.date}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMatch({
                        foundItemId: item.id,
                        id: item.id,
                        title: item.title || item.name || item.item,
                        item: item.title || item.name || item.item,
                        category: item.category,
                        location: item.location || item.station,
                        station: item.location || item.station,
                        description: item.description || item.desc
                      });
                      navigate("user-claim-verify");
                    }}
                    className="mt-4 w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Shield size={14} /> Claim This Item
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI MATCHES TAB */}
      {activeTab === "ai" && (
        <div>
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
              <Cpu size={32} className="text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-[#111827] font-semibold text-base">No AI matches generated yet</p>
              <p className="text-xs text-[#6B7280] mt-1">Check the System Vault tab above to manually search all registered found items.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredMatches.map((m) => (
                <div key={m.id || `${m.lostItemId}_${m.foundItemId}`} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all space-y-4 font-[Inter,sans-serif]">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Cpu size={16} className="text-[#2563EB]" />
                      <span className="text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        AI Match #{m.id}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${m.confidence === "high" ? "bg-green-100 text-green-700" : m.confidence === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {m.confidence === "high" ? "High Confidence" : m.confidence === "medium" ? "Medium Confidence" : "Low Confidence"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${confidenceColor(m.score)}`}>
                        {m.score}% Similarity
                      </span>
                    </div>
                  </div>

                  {/* Dual Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Reported Lost Item */}
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
                            Reported Lost Item #{m.lostItemId}
                          </span>
                          <span className="text-[10px] text-[#6B7280] font-medium">{m.lostItemCategory}</span>
                        </div>
                        {m.lostItemImg ? (
                          <img src={m.lostItemImg} alt={m.lostItemName} className="w-full h-36 object-cover rounded-lg bg-[#E2E8F0] mb-2" />
                        ) : (
                          <div className="w-full h-36 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#9CA3AF] mb-2">
                            <Package size={28} />
                          </div>
                        )}
                        <h4 className="font-bold text-[#111827] text-sm">{m.lostItemName}</h4>
                        <p className="text-xs text-[#4B5563] mt-1 line-clamp-2">{m.lostItemDescription}</p>
                      </div>
                      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#6B7280] flex-wrap gap-1">
                        <span><MapPin size={11} className="inline mr-0.5 text-[#2563EB]" /> {m.lostItemLocation}</span>
                        <span><User size={11} className="inline mr-0.5 text-[#2563EB]" /> {m.lostItemReporter}</span>
                      </div>
                    </div>

                    {/* Right Column: Matched Found Item in Vault */}
                    <div className="bg-[#F0FDF4] p-4 rounded-xl border border-[#DCFCE7] space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded">
                            Found Vault Item #{m.foundItemId}
                          </span>
                          <span className="text-[10px] text-[#15803D] font-medium">{m.foundItemCategory}</span>
                        </div>
                        {m.foundItemImg ? (
                          <img src={m.foundItemImg} alt={m.foundItemName} className="w-full h-36 object-cover rounded-lg bg-[#DCFCE7] mb-2" />
                        ) : (
                          <div className="w-full h-36 bg-[#DCFCE7] rounded-lg flex items-center justify-center text-[#86EFAC] mb-2">
                            <Package size={28} />
                          </div>
                        )}
                        <h4 className="font-bold text-[#111827] text-sm">{m.foundItemName}</h4>
                        <p className="text-xs text-[#4B5563] mt-1 line-clamp-2">{m.foundItemDescription}</p>
                      </div>
                      <div className="pt-2 border-t border-[#DCFCE7] flex items-center justify-between text-[11px] text-[#15803D] flex-wrap gap-1">
                        <span><MapPin size={11} className="inline mr-0.5 text-[#16A34A]" /> {m.foundItemStation}</span>
                        <span><User size={11} className="inline mr-0.5 text-[#16A34A]" /> {m.foundItemReporter}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress Bar */}
                  <div className="space-y-3">
                    <div className="w-full bg-[#F3F4F6] rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${m.score >= 90 ? "bg-[#16A34A]" : m.score >= 80 ? "bg-[#CA8A04]" : "bg-[#DC2626]"}`} style={{ width: `${m.score}%` }} />
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F3F4F6] flex-wrap">
                      <div className="text-xs text-[#6B7280] flex items-center gap-1">
                        <Calendar size={12} /> Registered: {m.date}
                      </div>
                      <div className="flex items-center gap-2">
                        {role === "staff" || role === "admin" ? (
                          <>
                            <button
                              onClick={() => handleAcceptMatch(m)}
                              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Check size={14} /> Accept Match
                            </button>
                            <button
                              onClick={() => handleRejectMatch(m)}
                              className="border border-[#D1D5DB] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                if (setSelectedMatch) setSelectedMatch(m);
                                navigate("user-claim-verify");
                              }}
                              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Shield size={14} /> Claim This Item
                            </button>
                            <button
                              onClick={() => {
                                if (setSelectedMatch) setSelectedMatch(m);
                                navigate("user-match-detail");
                              }}
                              className="px-3.5 py-2 border border-[#D1D5DB] text-xs text-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-colors font-medium"
                            >
                              Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MATCH DETAIL PAGE ────────────────────────────────────────────────────────
function MatchDetailPage({ navigate, selectedMatch, setSelectedMatch }) {
  if (!selectedMatch) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5 font-[Inter,sans-serif]">
        <button onClick={() => navigate("user-ai-matches")} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
          <ChevronRight size={14} className="rotate-180" /> Back to matches
        </button>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <Cpu size={32} className="text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#111827] font-semibold text-base">No match selected</p>
          <p className="text-xs text-[#6B7280] mt-1">Please select an AI match from your matches page.</p>
        </div>
      </div>
    );
  }
  const m = selectedMatch;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 font-[Inter,sans-serif]">
      <button onClick={() => navigate("user-ai-matches")} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
        <ChevronRight size={14} className="rotate-180" /> Back to matches
      </button>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="relative h-64 bg-[#F3F4F6]">
          <img src={m.img} alt={m.lostItem} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${confidenceColor(m.score)}`}>{m.score}% Match</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">{m.lostItem}</h2>
            <p className="text-[#6B7280] text-sm mt-1">Matched with: {m.foundItem}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[["Found At", m.station], ["Date Found", m.date], ["Reported By", "Station Staff"]].map(([l, v]) => (
              <div key={l} className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-xs text-[#6B7280] font-medium">{l}</p>
                <p className="text-sm font-semibold text-[#111827] mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed">{m.description || "Matching item discovered at station platform. It has been secured in the station vault."}</p>
        </div>
      </div>

      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Cpu size={18} className="text-[#2563EB]" />
          <h3 className="font-semibold text-[#111827]">Why AI thinks this is a match</h3>
        </div>
        <div className="space-y-3">
          {[
            { feature: "Shape & Size", score: 96, desc: "Matching physical dimensions" },
            { feature: "Color", score: 98, desc: "Color palette match confirmed" },
            { feature: "Brand Markings", score: 91, desc: "Identified brand logo" },
            { feature: "Location Context", score: 88, desc: "Station and route match" }
          ].map(({ feature, score, desc }) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-32 text-xs font-medium text-[#111827] shrink-0">{feature}</div>
              <div className="flex-1 bg-white rounded-full h-2">
                <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${score}%` }} />
              </div>
              <span className="text-xs font-bold text-[#2563EB] w-10 text-right">{score}%</span>
              <span className="text-xs text-[#6B7280] hidden sm:block">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          setSelectedMatch(m);
          navigate("user-claim-verify");
        }}
        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Shield size={16} /> Claim This Item
      </button>
    </div>
  );
}

// ─── CLAIM VERIFY PAGE ────────────────────────────────────────────────────────
function ClaimVerifyPage({ navigate, selectedMatch, addClaim, setActiveClaim }) {
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [answers, setAnswers] = useState({
    color: "",
    brand: "",
    marks: "",
    contents: ""
  });

  useEffect(() => {
    return () => {
      if (proofPreviewUrl) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
      setProofFile(file);
      setProofPreviewUrl(URL.createObjectURL(file));
      toast.success(`Proof document attached: ${file.name}`);
    }
  };

  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    setProofFile(null);
    setProofPreviewUrl(null);
    toast.info("Attached proof document removed");
  };

  const handleSubmitClaim = async () => {
    setLoading(true);
    try {
      const verificationProofText = `Color: ${answers.color || "N/A"}\nBrand: ${answers.brand || "N/A"}\nMarks: ${answers.marks || "N/A"}\nContents: ${answers.contents || "N/A"}`;
      const requestData = {
        lostItemId: selectedMatch?.lostItemId || selectedMatch?.id || 1,
        foundItemId: selectedMatch?.foundItemId || selectedMatch?.id || 1,
        verificationProof: verificationProofText
      };
      const createdClaim = await submitClaimApi(requestData, proofFile);
      if (selectedMatch?.station || selectedMatch?.location) {
        createdClaim.station = selectedMatch.station || selectedMatch.location;
      }
      if (setActiveClaim) setActiveClaim(createdClaim);
      addClaim(createdClaim);
      toast.success("Ownership claim submitted for staff verification!");
      navigate("user-claim-success");
    } catch (err) {
      console.error("Submit claim error:", err);
      const serverMsg = err.response?.data?.message || "Failed to submit claim. Please check your details.";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h2 className="text-lg font-bold text-[#111827] mb-1">Ownership Verification</h2>
        <p className="text-sm text-[#6B7280] mb-6">To ensure the item reaches the right person, please answer the verification questions below.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Item Color Details</label>
            <input
              value={answers.color}
              onChange={(e) => setAnswers({ ...answers, color: e.target.value })}
              placeholder="e.g. Black with silver zippers"
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Brand Name</label>
            <input
              value={answers.brand}
              onChange={(e) => setAnswers({ ...answers, brand: e.target.value })}
              placeholder="e.g. Samsonite, VIP, American Tourister"
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Unique Identification Marks</label>
            <input
              value={answers.marks}
              onChange={(e) => setAnswers({ ...answers, marks: e.target.value })}
              placeholder="e.g. Scratch on front wheel, red ribbon tied on handle"
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Contents Inside</label>
            <input
              value={answers.contents}
              onChange={(e) => setAnswers({ ...answers, contents: e.target.value })}
              placeholder="Briefly describe what was inside the bag"
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Upload Additional Proof</label>
            <label className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center hover:border-[#2563EB] transition-colors cursor-pointer block relative">
              <Upload size={20} className="text-[#9CA3AF] mx-auto mb-1" />
              <p className="text-sm text-[#6B7280]">{proofFile ? `Attached: ${proofFile.name}` : "Purchase receipt, previous photos, etc."}</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {proofPreviewUrl && (
              <div className="mt-3 flex items-center gap-3 bg-[#F8FAFC] border border-[#E5E7EB] p-3 rounded-xl">
                <img src={proofPreviewUrl} alt="Proof Thumbnail" className="w-16 h-16 object-cover rounded-lg border border-[#D1D5DB]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#111827] truncate">{proofFile?.name}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{(proofFile?.size / 1024).toFixed(1)} KB — Image Preview Ready</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 bg-[#FEF2F2] text-[#DC2626] hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmitClaim}
          className="w-full mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? <><RefreshCw size={15} className="animate-spin" /> Submitting…</> : "Submit Claim"}
        </button>
      </div>
    </div>
  );
}

// ─── CLAIM SUCCESS PAGE ───────────────────────────────────────────────────────
function ClaimSuccessPage({ navigate, activeClaim, authUser, selectedMatch }) {
  const steps = [
    { label: "Submitted", done: true },
    { label: "Under Verification", done: true },
    { label: "Approved", done: false },
    { label: "Ready for Collection", done: false }
  ];

  const handleDownloadReceipt = () => {
    const claimIdStr = activeClaim?.id || (activeClaim?.rawId ? `CLM-${activeClaim.rawId}` : `CLM-${Date.now()}`);
    const dateStr = activeClaim?.date || new Date().toLocaleDateString();
    const statusStr = activeClaim?.status || "Under Verification";
    const stationStr = activeClaim?.station || selectedMatch?.station || selectedMatch?.location || "Station Vault";
    const userNameStr = authUser?.name || authUser?.email || "Passenger";

    const textContent = `SMART LOST & FOUND SYSTEM - CLAIM RECEIPT
Claim ID: ${claimIdStr}
Date: ${dateStr}
Status: ${statusStr}
Station: ${stationStr}
User: ${userNameStr}

Please present this receipt along with a valid Govt photo ID at the station Lost & Found counter.`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Smart-LF-Receipt-${claimIdStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded successfully!");
  };

  return (
    <div className="p-6 flex items-center justify-center min-h-[70vh] font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center max-w-lg w-full animate-in zoom-in-95">
        <div className="w-20 h-20 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-[#16A34A]" />
        </div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Claim Submitted Successfully!</h2>
        <p className="text-[#6B7280] mb-8">Our team will verify your ownership and contact you within 24 hours.</p>

        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#E5E7EB] -z-0" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s.done ? "bg-[#16A34A] border-[#16A34A] text-white" : i === 2 ? "bg-white border-[#2563EB] text-[#2563EB]" : "bg-white border-[#D1D5DB] text-[#9CA3AF]"}`}>
                {s.done ? <Check size={16} /> : i + 1}
              </div>
              <p className={`text-xs font-medium ${s.done ? "text-[#16A34A]" : i === 2 ? "text-[#2563EB]" : "text-[#9CA3AF]"} text-center`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleDownloadReceipt} className="flex-1 flex items-center justify-center gap-2 border border-[#D1D5DB] text-[#6B7280] font-medium py-2.5 rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors">
            <Download size={14} /> Download Receipt
          </button>
          <button onClick={() => navigate("user-dashboard")} className="flex-1 bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8] transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MY REPORTS PAGE ──────────────────────────────────────────────────────────
function MyReportsPage({ myLostItems = [], openModal }) {
  const [myItems, setMyItems] = useState(myLostItems);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const tabs = ["All", "Active", "Matched", "Pending", "Closed"];

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const reports = await getMyLostItemsApi();
        setMyItems(Array.isArray(reports) ? reports : []);
      } catch (err) {
        console.error("Failed to fetch my lost reports:", err);
        setMyItems(myLostItems);
      }
    };
    fetchMyReports();
  }, []);

  const itemsToDisplay = myItems;

  const filtered = itemsToDisplay.filter((r) => {
    const q = (r.item || r.title || "").toLowerCase().includes(search.toLowerCase()) ||
              (r.station || r.locationLost || "").toLowerCase().includes(search.toLowerCase());
    if (!q) return false;
    if (tab === "Active") return r.status === "Searching" || r.status === "Reported";
    if (tab === "Matched") return r.status === "Matched";
    if (tab === "Pending") return r.status === "Pending" || r.status === "Searching";
    if (tab === "Closed") return r.status === "Closed" || r.status === "Resolved";
    return true;
  });

  return (
    <div className="p-6 space-y-5 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 flex-wrap">
          <div className="flex">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-4 text-sm font-medium transition-colors ${tab === t ? "border-b-2 border-[#2563EB] text-[#2563EB]" : "text-[#6B7280] hover:text-[#111827]"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative py-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search my reports…"
              className="pl-8 pr-3 py-1.5 text-xs border border-[#D1D5DB] rounded-lg outline-none focus:border-[#2563EB] w-48"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>

        <div className="p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Inbox size={32} className="text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-[#6B7280] font-medium">No reports found in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] hover:border-[#DBEAFE] transition-all">
                  {item.img || item.imageUrl ? (
                    <img src={item.img || item.imageUrl} alt={item.item || item.title} className="w-12 h-12 object-cover rounded-xl shrink-0 bg-[#F3F4F6]" />
                  ) : (
                    <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                      <Tag size={16} className="text-[#2563EB]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] text-sm">{item.item}</p>
                    <p className="text-xs text-[#6B7280]">{item.category} · {item.station} · {item.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(item.status)}`}>{item.status}</span>
                  {item.match && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${confidenceColor(item.match)}`}>{item.match}%</span>}
                  <button onClick={() => openModal("trackReport", item)} className="text-xs font-medium text-[#2563EB] hover:underline">Track Status</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────
function NotificationsPage({ notifications, setNotifications }) {
  const [notifList, setNotifList] = useState(notifications);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const iconMap = { success: CheckCircle, info: Info, warning: AlertTriangle };
  const colorMap = { success: "text-[#16A34A] bg-[#DCFCE7]", info: "text-[#2563EB] bg-[#DBEAFE]", warning: "text-[#CA8A04] bg-[#FEF9C3]" };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await getNotificationsApi();
      if (res && res.content && res.content.length > 0) {
        setNotifList(res.content);
        setNotifications(res.content);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadItems = notifList.filter(n => !n.read);
      await Promise.allSettled(unreadItems.map(n => markNotificationReadApi(n.id)));
      const updated = notifList.map(n => ({ ...n, read: true }));
      setNotifList(updated);
      setNotifications(updated);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await markNotificationReadApi(id);
    } catch (e) {
      // Ignore if server delete not supported
    }
    const updated = notifList.filter(n => n.id !== id);
    setNotifList(updated);
    setNotifications(updated);
    toast.info("Notification dismissed");
  };

  const displayList = notifList.length > 0 ? notifList : notifications;
  const filtered = displayList.filter(n => filterType === "all" ? true : n.type === filterType);

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto font-[Inter,sans-serif]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#111827]">Notifications</h2>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-[#D1D5DB] rounded-lg px-2.5 py-1 text-[#6B7280] bg-white outline-none"
          >
            <option value="all">All Types</option>
            <option value="success">Success Alerts</option>
            <option value="info">Information</option>
            <option value="warning">Warnings</option>
          </select>
          <button onClick={handleMarkAllRead} className="text-xs text-[#2563EB] hover:underline font-medium">Mark all read</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
          <Bell size={28} className="text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#6B7280]">No notifications to display</p>
        </div>
      ) : (
        filtered.map((n) => {
          const Icon = iconMap[n.type] || Info;
          return (
            <div key={n.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-start gap-3 hover:shadow-sm transition-all relative group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{n.title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{n.body}</p>
              </div>
              <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{n.time}</span>
              <button
                onClick={() => handleDismiss(n.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#9CA3AF] hover:text-[#DC2626]"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ role, openModal }) {
  const { user, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notifications2, setNotifications2] = useState(user?.emailNotifications ?? true);
  const [sms, setSms] = useState(user?.smsNotifications ?? false);

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return "Not available";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Not available";
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch (e) {
      return "Not available";
    }
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    memberSince: formatMemberSince(user?.createdAt)
  });

  useEffect(() => {
    if (user?.userId) {
      setLoadingProfile(true);
      getUserProfileApi(user.userId)
        .then((data) => {
          if (data) {
            setProfileData({
              name: data.name || user.name || "",
              email: data.email || user.email || "",
              phone: data.phone || user.phone || "",
              memberSince: formatMemberSince(data.createdAt)
            });
            if (data.emailNotifications !== undefined) setNotifications2(data.emailNotifications);
            if (data.smsNotifications !== undefined) setSms(data.smsNotifications);
            updateUserProfile({
              name: data.name,
              phone: data.phone,
              createdAt: data.createdAt,
              emailNotifications: data.emailNotifications,
              smsNotifications: data.smsNotifications
            });
          }
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          toast.error(err.response?.data?.message || "Failed to load latest user profile");
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    } else {
      setLoadingProfile(false);
    }
  }, [user?.userId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.userId) {
      toast.error("Invalid user session");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfileApi(user.userId, {
        name: profileData.name,
        phone: profileData.phone,
        emailNotifications: notifications2,
        smsNotifications: sms
      });
      updateUserProfile({
        name: updated.name,
        phone: updated.phone,
        emailNotifications: updated.emailNotifications,
        smsNotifications: updated.smsNotifications
      });
      toast.success("Profile details saved to backend database!");
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile on backend");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEmail = async () => {
    const nextVal = !notifications2;
    setNotifications2(nextVal);
    if (user?.userId) {
      try {
        await updateProfileApi(user.userId, { emailNotifications: nextVal });
        updateUserProfile({ emailNotifications: nextVal });
        toast.success("Email notification preference updated!");
      } catch (err) {
        setNotifications2(!nextVal);
        toast.error("Failed to save notification preference");
      }
    }
  };

  const handleToggleSms = async () => {
    const nextVal = !sms;
    setSms(nextVal);
    if (user?.userId) {
      try {
        await updateProfileApi(user.userId, { smsNotifications: nextVal });
        updateUserProfile({ smsNotifications: nextVal });
        toast.success("SMS notification preference updated!");
      } catch (err) {
        setSms(!nextVal);
        toast.error("Failed to save SMS notification preference");
      }
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-5 font-[Inter,sans-serif] text-center text-[#6B7280] py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading profile from database…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 font-[Inter,sans-serif]">
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {(profileData.name[0] || "U").toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-[#111827] text-lg">{profileData.name || "User Profile"}</h2>
            <p className="text-sm text-[#6B7280] capitalize">{role} Account</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="ml-auto flex items-center gap-1.5 text-sm text-[#2563EB] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-2 rounded-xl hover:bg-[#DBEAFE] transition-colors font-medium disabled:opacity-50"
          >
            <Edit2 size={13} /> {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Full Name</label>
            <input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Email Address</label>
            <input
              disabled
              value={profileData.email}
              className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-[#F9FAFB] text-[#6B7280]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Phone Number</label>
            <input
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Member Since</label>
            <input
              disabled
              value={profileData.memberSince}
              className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-[#F9FAFB] text-[#6B7280]"
            />
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h3 className="font-semibold text-[#111827]">Security & Password</h3>
        <button onClick={() => openModal("changePassword")} className="flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:underline">
          <Lock size={14} /> Change Password
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h3 className="font-semibold text-[#111827]">Notification Settings</h3>
        {[
          { label: "Email Notifications", sub: "Receive alerts via email", state: notifications2, toggle: handleToggleEmail },
          { label: "SMS Notifications", sub: "Receive alerts via SMS", state: sms, toggle: handleToggleSms }
        ].map(({ label, sub, state, toggle }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-0">
            <div>
              <p className="text-sm font-medium text-[#111827]">{label}</p>
              <p className="text-xs text-[#6B7280]">{sub}</p>
            </div>
            <button onClick={toggle} className={`relative w-11 h-6 rounded-full transition-colors ${state ? "bg-[#2563EB]" : "bg-[#D1D5DB]"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${state ? "translate-x-5" : ""}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAFF DASHBOARD ──────────────────────────────────────────────────────────
function StaffDashboard({ navigate, foundItems, claims }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getStaffDashboardApi()
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch((err) => console.log("Staff dashboard backend API offline, using local metrics:", err));
  }, []);

  const totalFound = summary?.totalFoundItems ?? foundItems.length;
  const pendingCount = summary?.pendingClaims ?? claims.length;
  const totalMatches = summary?.totalMatches ?? 11;
  const totalResolved = summary?.resolvedItems ?? 18;

  return (
    <div className="p-6 space-y-6 font-[Inter,sans-serif]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard onClick={() => navigate("staff-manage")} icon={Package} label="Items in Custody" value={totalFound.toString()} delta="Active" color="bg-[#16A34A]" />
        <StatCard onClick={() => navigate("staff-claims")} icon={Shield} label="Pending Claims" value={pendingCount.toString()} delta="Needs Review" color="bg-[#CA8A04]" />
        <StatCard onClick={() => navigate("staff-ai")} icon={Cpu} label="AI Matches" value={totalMatches.toString()} color="bg-[#2563EB]" />
        <StatCard onClick={() => navigate("staff-manage")} icon={CheckCircle} label="Items Returned" value={totalResolved.toString()} delta="Resolved" color="bg-[#7C3AED]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Register Found Item", icon: Package, page: "staff-register", color: "bg-[#16A34A] text-white hover:bg-[#15803D]" },
              { label: "View Pending Claims", icon: Shield, page: "staff-claims", color: "bg-[#CA8A04] text-white hover:bg-[#A16207]" },
              { label: "Review AI Matches", icon: Cpu, page: "staff-ai", color: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]" },
              { label: "Manage Found Items", icon: ClipboardList, page: "staff-manage", color: "bg-[#F9FAFB] text-[#111827] border border-[#D1D5DB] hover:bg-[#F3F4F6]" }
            ].map(({ label, icon: Icon, page, color }) => (
              <button key={label} onClick={() => navigate(page)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${color}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Recent Station Activity</h3>
          <div className="space-y-3">
            {[
              { action: "iPhone 15 registered", time: "10 min ago", type: "found" },
              { action: "Claim approved for Wallet", time: "45 min ago", type: "approved" },
              { action: "Bag transferred to vault", time: "2h ago", type: "transfer" },
              { action: "AI matched trolley bag", time: "3h ago", type: "match" }
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${a.type === "found" ? "bg-[#16A34A]" : a.type === "approved" ? "bg-[#2563EB]" : a.type === "match" ? "bg-[#7C3AED]" : "bg-[#CA8A04]"}`} />
                <p className="text-sm text-[#111827] flex-1">{a.action}</p>
                <p className="text-xs text-[#9CA3AF]">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STAFF MANAGE ITEMS PAGE ──────────────────────────────────────────────────
function StaffManagePage({ foundItems, updateFoundItemStatus, openModal, globalSearch }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const filtered = foundItems.filter((item) => {
    const qTerm = (search || globalSearch || "").toLowerCase();
    const q = (item.title || item.name || "").toLowerCase().includes(qTerm) ||
              (item.location || item.station || "").toLowerCase().includes(qTerm) ||
              (item.category || "").toLowerCase().includes(qTerm);
    const c = filterCat === "all" ? true : item.category === filterCat;
    return q && c;
  });

  return (
    <div className="p-6 space-y-5 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] flex-wrap gap-3">
          <h2 className="font-semibold text-[#111827]">Manage Found Items</h2>
          <div className="flex items-center gap-3">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="text-xs border border-[#D1D5DB] rounded-lg px-2.5 py-2 text-[#6B7280] bg-white outline-none"
            >
              <option value="all">All Categories</option>
              {INITIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="pl-8 pr-3 py-2 text-xs border border-[#D1D5DB] rounded-lg outline-none focus:border-[#2563EB] w-48"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                {["Item", "Category", "Date Found", "Location", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#6B7280] py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F6]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      {item.img || item.imageUrl ? (
                        <img src={item.img || item.imageUrl} alt={item.name || item.title} className="w-10 h-10 rounded-lg object-cover bg-[#F3F4F6]" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                          <Package size={18} />
                        </div>
                      )}
                      <span className="font-medium text-[#111827]">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-[#6B7280]">{item.category}</td>
                  <td className="py-3 px-5 text-[#6B7280]">{item.date}</td>
                  <td className="py-3 px-5 text-[#6B7280]">{item.location}</td>
                  <td className="py-3 px-5">
                    <select
                      value={item.status}
                      onChange={(e) => updateFoundItemStatus(item.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full outline-none border ${statusColor(item.status)}`}
                    >
                      <option value="Available">Available</option>
                      <option value="Verification">Verification</option>
                      <option value="Claimed">Claimed</option>
                      <option value="Disposed">Disposed</option>
                    </select>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openModal("viewItem", item)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors" title="View Details">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openModal("editItem", item)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEF3C7] hover:text-[#CA8A04] transition-colors" title="Edit Item">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => openModal("deleteItem", item)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors" title="Delete Item">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── STAFF CLAIMS PAGE ────────────────────────────────────────────────────────
function StaffClaimsPage({ claims, approveClaim, rejectClaim, openModal }) {
  const [claimList, setClaimList] = useState(claims);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await getAllClaimsApi();
      if (res && Array.isArray(res.content)) {
        setClaimList(res.content);
      }
    } catch (err) {
      console.error("Failed to fetch all claims for staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claim) => {
    const targetId = claim.rawId || claim.id;
    try {
      const updated = await reviewClaimApi(targetId, "APPROVED", "Ownership proof verified by staff");
      setClaimList(claimList.map((c) => (c.id === claim.id ? updated : c)));
      approveClaim(claim.id);
      toast.success(`Claim ${claim.id} approved! Item resolved and claimant notified.`);
    } catch (err) {
      console.error("Approve claim error:", err);
      toast.error(err.response?.data?.message || "Failed to approve claim");
    }
  };

  const handleReject = async (claim) => {
    const targetId = claim.rawId || claim.id;
    try {
      const updated = await reviewClaimApi(targetId, "REJECTED", "Verification proof rejected by staff");
      setClaimList(claimList.map((c) => (c.id === claim.id ? updated : c)));
      rejectClaim(claim.id);
      toast.error(`Claim ${claim.id} rejected.`);
    } catch (err) {
      console.error("Reject claim error:", err);
      toast.error(err.response?.data?.message || "Failed to reject claim");
    }
  };

  const displayClaims = claimList;

  return (
    <div className="p-6 space-y-5 font-[Inter,sans-serif]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#111827]">Pending Ownership Claims</h2>
        <span className="text-xs text-[#6B7280]">{displayClaims.length} claims awaiting review</span>
      </div>

      {displayClaims.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <Shield size={32} className="text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] font-medium">No pending claims at this time</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayClaims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">{claim.id}</span>
                    <h3 className="font-semibold text-[#111827]">{claim.item}</h3>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">Claimant: <span className="font-medium text-[#111827]">{claim.claimant}</span> ({claim.phone || claim.email})</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(claim.status)}`}>{claim.status}</span>
              </div>

              {claim.notes && claim.notes.includes("SUSPICIOUS") && (
                <div className="mt-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-[#DC2626]">
                  <AlertTriangle size={16} className="shrink-0 text-[#DC2626]" />
                  <span>AI Fraud Warning: {claim.notes}</span>
                </div>
              )}

              <div className="mt-4 bg-[#F8FAFC] rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-[#6B7280]">Station:</span> <p className="font-medium text-[#111827]">{claim.station}</p></div>
                <div><span className="text-[#6B7280]">Date:</span> <p className="font-medium text-[#111827]">{claim.date}</p></div>
                <div><span className="text-[#6B7280]">Color:</span> <p className="font-medium text-[#111827]">{claim.answers?.color || "N/A"}</p></div>
                <div><span className="text-[#6B7280]">Brand:</span> <p className="font-medium text-[#111827]">{claim.answers?.brand || "N/A"}</p></div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#F3F4F6]">
                <button onClick={() => openModal("reviewClaim", claim)} className="px-3 py-1.5 border border-[#D1D5DB] text-xs font-medium text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors">
                  View Proof & Answers
                </button>
                <button
                  onClick={() => handleReject(claim)}
                  className="px-3 py-1.5 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => handleApprove(claim)}
                  className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Approve Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ navigate, lostItems, foundItems, claims, users }) {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAdminDashboardApi()
      .then((data) => { if (data) setSummary(data); })
      .catch((err) => console.log("Admin summary backend offline:", err));
    getAnalyticsApi()
      .then((data) => { if (data) setAnalytics(data); })
      .catch((err) => console.log("Analytics backend offline:", err));
  }, []);

  const totalLost = lostItems.length;
  const totalFound = foundItems.length;
  const pendingCount = claims.filter((c) => c.rawStatus === "PENDING" || c.status === "Under Verification").length;
  const totalResolved = claims.filter((c) => c.rawStatus === "APPROVED" || c.status === "Approved").length;
  const totalReportsCount = totalLost + totalFound;
  const resolutionRateNum = totalReportsCount > 0 ? Math.round((totalResolved / totalReportsCount) * 100) : 0;
  const resRate = `${resolutionRateNum}%`;

  // Compute dynamic category distribution
  const categoryCounts = {};
  [...lostItems, ...foundItems].forEach((item) => {
    const cat = item.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryColors = ["#2563EB", "#16A34A", "#CA8A04", "#7C3AED", "#0891B2", "#DC2626"];
  const categoryList = Object.keys(categoryCounts);
  const dynamicCategoryData = categoryList.length > 0
    ? categoryList.map((cat, i) => ({
        name: cat,
        value: categoryCounts[cat],
        percentage: Math.round((categoryCounts[cat] / (totalReportsCount || 1)) * 100),
        color: categoryColors[i % categoryColors.length]
      }))
    : [{ name: "General", value: 1, percentage: 100, color: "#2563EB" }];

  // Compute dynamic monthly data
  const monthsMap = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 };
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
  monthsMap[currentMonthName] = totalLost;

  const dynamicMonthlyData = [
    { month: currentMonthName, lost: totalLost, found: totalFound }
  ];

  return (
    <div className="p-6 space-y-6 font-[Inter,sans-serif]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard onClick={() => navigate("admin-lost")} icon={FileText} label="Total Lost Reports" value={totalLost.toString()} delta="Total Logged" color="bg-[#2563EB]" />
        <StatCard onClick={() => navigate("admin-found")} icon={Package} label="Total Found Items" value={totalFound.toString()} delta="Total Found" color="bg-[#16A34A]" />
        <StatCard onClick={() => navigate("admin-claims")} icon={Shield} label="Pending Claims" value={pendingCount.toString()} delta="Under Review" color="bg-[#CA8A04]" />
        <StatCard onClick={() => navigate("admin-users")} icon={Users} label="Registered Users" value={users.length.toString()} delta="Active Accounts" color="bg-[#7C3AED]" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h3 className="font-semibold text-[#111827] mb-4">Item Category Distribution</h3>
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="55%" height={200}>
            <RechartsPie>
              <Pie data={dynamicCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {dynamicCategoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5">
            {dynamicCategoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-[#6B7280] flex-1">{c.name}</span>
                <span className="text-xs font-bold text-[#111827]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN LOST ITEMS ─────────────────────────────────────────────────────────
function AdminLostItems({ lostItems, openModal, globalSearch }) {
  const [search, setSearch] = useState("");
  const filtered = lostItems.filter((r) => {
    const itemName = (r?.item || r?.title || "").toLowerCase();
    const reporterName = (r?.reporter || (r?.reportedBy ? `User #${r.reportedBy}` : "")).toLowerCase();
    const category = (r?.category || "").toLowerCase();
    const station = (r?.station || r?.location || "").toLowerCase();
    const q = (search || globalSearch || "").toLowerCase();
    return itemName.includes(q) || reporterName.includes(q) || category.includes(q) || station.includes(q);
  });

  return (
    <div className="p-6 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lost items…"
                className="pl-8 pr-3 py-2 text-xs border border-[#D1D5DB] rounded-lg w-52 outline-none focus:border-[#2563EB]"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span>1–{filtered.length} of {filtered.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                {["Item Name", "Category", "Reported By", "Date", "Station", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#6B7280] py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827]">{row.item}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{row.category}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{row.reporter}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{row.date}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{row.station}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal("viewItem", row)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"><Eye size={13} /></button>
                      <button onClick={() => openModal("editItem", row)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEF3C7] hover:text-[#CA8A04] transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => openModal("deleteItem", row)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN AI REVIEW ──────────────────────────────────────────────────────────
function AdminAIReview({ aiMatches, openModal }) {
  return (
    <div className="p-6 space-y-5 font-[Inter,sans-serif]">
      {aiMatches.map((m) => (
        <div key={m.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-start gap-6 flex-wrap sm:flex-nowrap">
            <div className="text-center">
              <p className="text-xs text-[#6B7280] mb-2 font-medium">Lost Item</p>
              <img src={m.img} alt="lost" className="w-24 h-24 rounded-xl object-cover bg-[#F3F4F6]" />
              <p className="text-xs font-medium text-[#111827] mt-2 max-w-[96px] truncate">{m.lostItem}</p>
            </div>
            <div className="flex flex-col items-center justify-center self-center gap-2">
              <div className={`text-lg font-extrabold px-4 py-2 rounded-xl ${confidenceColor(m.score)}`}>{m.score}%</div>
              <div className="w-0.5 h-12 bg-[#E5E7EB]" />
              <Cpu size={16} className="text-[#9CA3AF]" />
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6B7280] mb-2 font-medium">Found Item</p>
              <img src={m.img} alt="found" className="w-24 h-24 rounded-xl object-cover bg-[#F3F4F6] opacity-80" />
              <p className="text-xs font-medium text-[#111827] mt-2 max-w-[96px] truncate">{m.foundItem}</p>
            </div>
            <div className="flex-1 min-w-0 ml-2">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-[#111827]">AI Match #{m.id}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor(m.score)}`}>
                  {m.confidence === "high" ? "High" : m.confidence === "medium" ? "Medium" : "Low"} Confidence
                </span>
              </div>
              <div className="space-y-1.5 mb-4 text-xs text-[#6B7280]">
                <div className="flex items-center gap-1.5"><MapPin size={11} />{m.station}</div>
                <div className="flex items-center gap-1.5"><Calendar size={11} />{m.date}</div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={async () => {
                    try {
                      await updateMatchStatusApi(m.id, "CONFIRMED");
                      toast.success(`AI Match #${m.id} confirmed!`);
                    } catch (e) {
                      toast.error("Failed to confirm match");
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#15803D] transition-colors"
                >
                  <Check size={12} /> Approve Match
                </button>
                <button
                  onClick={async () => {
                    try {
                      await updateMatchStatusApi(m.id, "REJECTED");
                      toast.error(`AI Match #${m.id} rejected`);
                    } catch (e) {
                      toast.error("Failed to reject match");
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#DC2626] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X size={12} /> Reject Match
                </button>
                <button onClick={() => openModal("reviewClaim", m)} className="flex items-center gap-1.5 border border-[#D1D5DB] text-[#6B7280] text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors">
                  <Eye size={12} /> Manual Review
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
function AdminUsers({ users, openModal, globalSearch }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => {
    const q = (search || globalSearch || "").toLowerCase();
    return (u.name || "").toLowerCase().includes(q) ||
           (u.email || "").toLowerCase().includes(q) ||
           (u.phone || "").toLowerCase().includes(q) ||
           (u.role || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] flex-wrap gap-3">
          <h2 className="font-semibold text-[#111827]">User Management</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="pl-8 pr-3 py-2 text-xs border border-[#D1D5DB] rounded-lg w-48 outline-none focus:border-[#2563EB]"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
            <button onClick={() => openModal("addUser")} className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-medium px-3.5 py-2 rounded-xl hover:bg-[#1D4ED8] transition-colors">
              <User size={13} /> Add User
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                {["Name", "Email", "Phone", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#6B7280] py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-xs font-bold">{u.name[0]}</div>
                      <span className="font-medium text-[#111827]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-[#6B7280]">{u.email}</td>
                  <td className="py-3 px-5 text-[#6B7280]">{u.phone}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-[#F5F3FF] text-[#7C3AED]" : u.role === "staff" ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#EFF6FF] text-[#2563EB]"}`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(u.status)}`}>{u.status}</span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal("viewUser", u)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors" title="View User"><Eye size={13} /></button>
                      <button onClick={() => openModal("editUser", u)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEF3C7] hover:text-[#CA8A04] transition-colors" title="Edit User"><Edit2 size={13} /></button>
                      <button onClick={() => openModal("deleteUser", u)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors" title="Delete User"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN STATIONS PAGE ──────────────────────────────────────────────────────
function AdminStations({ stations, openModal, globalSearch }) {
  const [search, setSearch] = useState("");
  const filtered = stations.filter(s => {
    const q = (search || globalSearch || "").toLowerCase();
    return s.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] flex-wrap gap-3">
          <h2 className="font-semibold text-[#111827]">Station Management</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stations…"
                className="pl-8 pr-3 py-2 text-xs border border-[#D1D5DB] rounded-lg w-48 outline-none focus:border-[#2563EB]"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
            <button onClick={() => openModal("addStation")} className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-medium px-3.5 py-2 rounded-xl hover:bg-[#1D4ED8] transition-colors">
              <Building size={13} /> Add Station
            </button>
          </div>
        </div>
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((st, i) => (
            <div key={i} className="p-4 rounded-xl border border-[#E5E7EB] flex items-center justify-between hover:shadow-sm transition-all bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                  <Building size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{st}</p>
                  <p className="text-xs text-[#6B7280]">Active Counter & Vault</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openModal("editStation", st)} className="p-1 text-[#6B7280] hover:text-[#2563EB]"><Edit2 size={13} /></button>
                <button onClick={() => openModal("deleteStation", st)} className="p-1 text-[#6B7280] hover:text-[#DC2626]"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ANALYTICS ──────────────────────────────────────────────────────────
function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState("30d");

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Month,Lost,Found,RecoveryRate\nFeb,48,31,62%\nMar,62,44,71%\nApr,55,40,68%\nMay,78,58,75%\nJun,91,72,79%\nJul,84,69,74%";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smart-lf-analytics-${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${timeframe} analytics CSV report!`);
  };

  const recoveryData = [
    { month: "Feb", rate: 62 },
    { month: "Mar", rate: 71 },
    { month: "Apr", rate: 68 },
    { month: "May", rate: 75 },
    { month: "Jun", rate: 79 },
    { month: "Jul", rate: 74 }
  ];

  return (
    <div className="p-6 space-y-5 font-[Inter,sans-serif]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#111827]">Analytics & Insights</h2>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-xs border border-[#D1D5DB] rounded-lg px-3 py-1.5 text-[#6B7280] bg-white outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1D4ED8] transition-colors">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Avg Recovery Time" value="38h" delta="↓ 6h vs last month" color="bg-[#2563EB]" />
        <StatCard icon={Cpu} label="AI Accuracy" value="94.2%" delta="↑ 1.3% this month" color="bg-[#7C3AED]" />
        <StatCard icon={CheckCircle} label="Claim Success Rate" value="74%" delta="↑ 3% this month" color="bg-[#16A34A]" />
        <StatCard icon={Activity} label="Active Stations" value="218" color="bg-[#0891B2]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Claim Success Rate (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={recoveryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 90]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Area type="monotone" dataKey="rate" stroke="#7C3AED" strokeWidth={2} fill="url(#gRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Monthly Reports Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={INITIAL_MONTHLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="lost" name="Lost" fill="#DBEAFE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="found" name="Found" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN SETTINGS ───────────────────────────────────────────────────────────
function AdminSettings({ openModal }) {
  const [threshold, setThreshold] = useState(80);
  const [autoMatch, setAutoMatch] = useState(true);
  const [emailBackup, setEmailBackup] = useState(false);

  const handleSaveSettings = () => {
    toast.success("System configurations updated successfully!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 font-[Inter,sans-serif]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
        <h3 className="font-semibold text-[#111827]">AI Pipeline Status</h3>
        <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#166534]">Real-Time Multimodal AI Matching Pipeline</p>
            <p className="text-[11px] text-[#15803D]">CLIP Image Embeddings & SentenceTransformer Semantic Search Active</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#16A34A] text-white rounded-full">ACTIVE</span>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-[#F3F4F6]">
          <div>
            <p className="text-sm font-medium text-[#111827]">Auto AI Matching</p>
            <p className="text-xs text-[#6B7280]">Run AI when new reports are submitted</p>
          </div>
          <button onClick={() => setAutoMatch(!autoMatch)} className={`relative w-11 h-6 rounded-full transition-colors ${autoMatch ? "bg-[#2563EB]" : "bg-[#D1D5DB]"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${autoMatch ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h3 className="font-semibold text-[#111827]">Backup & Security</h3>
        <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
          <div>
            <p className="text-sm font-medium text-[#111827]">Automated Email Backup</p>
            <p className="text-xs text-[#6B7280]">Send daily backup report to admin email</p>
          </div>
          <button onClick={() => setEmailBackup(!emailBackup)} className={`relative w-11 h-6 rounded-full transition-colors ${emailBackup ? "bg-[#2563EB]" : "bg-[#D1D5DB]"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${emailBackup ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <button onClick={() => openModal("changePassword")} className="flex items-center gap-2 text-sm font-medium text-[#DC2626] hover:underline">
          <Lock size={14} /> Change Admin Password
        </button>
      </div>

      <button onClick={handleSaveSettings} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
        Save Settings
      </button>
    </div>
  );
}

// ─── SHELL LAYOUTS ────────────────────────────────────────────────────────────
function UserShell({ page, navigate, onLogout, role, lostItems, myLostItems, addLostItem, foundItems, addFoundItem, aiMatches, setSelectedMatch, selectedMatch, dismissMatch, claims, addClaim, activeClaim, setActiveClaim, authUser, notifications, setNotifications, globalSearch, setGlobalSearch, openModal }) {
  const titles = {
    "user-dashboard": ["Dashboard", "Welcome back"],
    "user-report-lost": ["Report Lost Item", "Submit a lost item report"],
    "user-report-found": ["Report Found Item", "Help reunite an item with its owner"],
    "user-ai-matches": ["AI Match Results", "Potential matches for your items"],
    "user-match-detail": ["Match Details", "Review and claim this match"],
    "user-claim-verify": ["Claim Verification", "Verify ownership to claim your item"],
    "user-claim-success": ["Claim Submitted", ""],
    "user-my-reports": ["My Reports", "All your lost and found reports"],
    "user-notifications": ["Notifications", "Stay updated on your items"],
    "user-profile": ["Profile", "Manage your account"]
  };
  const [title, subtitle] = titles[page] ?? ["Portal", ""];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-[Inter,sans-serif]">
      <UserSidebar current={page} navigate={navigate} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          role={role}
          navigate={navigate}
          notifications={notifications}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />
        <main className="flex-1 overflow-y-auto">
          {page === "user-dashboard" && <UserDashboard navigate={navigate} lostItems={lostItems} myLostItems={myLostItems} foundItems={foundItems} aiMatches={aiMatches} setSelectedMatch={setSelectedMatch} />}
          {page === "user-report-lost" && <ReportLostPage navigate={navigate} addLostItem={addLostItem} />}
          {page === "user-report-found" && <ReportFoundPage addFoundItem={addFoundItem} />}
          {page === "user-ai-matches" && <AIMatchesPage navigate={navigate} aiMatches={aiMatches} foundItems={foundItems} setSelectedMatch={setSelectedMatch} dismissMatch={dismissMatch} globalSearch={globalSearch} />}
          {page === "user-match-detail" && <MatchDetailPage navigate={navigate} selectedMatch={selectedMatch} setSelectedMatch={setSelectedMatch} />}
          {page === "user-claim-verify" && <ClaimVerifyPage navigate={navigate} selectedMatch={selectedMatch} addClaim={addClaim} setActiveClaim={setActiveClaim} />}
          {page === "user-claim-success" && <ClaimSuccessPage navigate={navigate} activeClaim={activeClaim} authUser={authUser} selectedMatch={selectedMatch} />}
          {page === "user-my-reports" && <MyReportsPage myLostItems={myLostItems} openModal={openModal} />}
          {page === "user-notifications" && <NotificationsPage notifications={notifications} setNotifications={setNotifications} />}
          {page === "user-profile" && <ProfilePage role={role} openModal={openModal} />}
        </main>
      </div>
    </div>
  );
}

function StaffShell({ page, navigate, onLogout, role, foundItems, addFoundItem, claims, approveClaim, rejectClaim, updateFoundItemStatus, aiMatches, setSelectedMatch, dismissMatch, notifications, setNotifications, globalSearch, setGlobalSearch, openModal }) {
  const titles = {
    "staff-dashboard": ["Staff Dashboard", "New Delhi Railway Station"],
    "staff-register": ["Register Found Item", "Log a newly found item"],
    "staff-manage": ["Manage Found Items", "Items in custody at your station"],
    "staff-claims": ["Pending Claims", "Review ownership claims"],
    "staff-ai": ["AI Matches", "Review AI-generated matches"],
    "user-notifications": ["Notifications", ""],
    "user-profile": ["Profile", ""]
  };
  const [title, subtitle] = titles[page] ?? ["Staff Portal", ""];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-[Inter,sans-serif]">
      <StaffSidebar current={page} navigate={navigate} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} role={role} navigate={navigate} notifications={notifications} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
        <main className="flex-1 overflow-y-auto">
          {page === "staff-dashboard" && <StaffDashboard navigate={navigate} foundItems={foundItems} claims={claims} />}
          {page === "staff-register" && <ReportFoundPage addFoundItem={addFoundItem} />}
          {page === "staff-manage" && <StaffManagePage foundItems={foundItems} updateFoundItemStatus={updateFoundItemStatus} openModal={openModal} globalSearch={globalSearch} />}
          {page === "staff-claims" && <StaffClaimsPage claims={claims} approveClaim={approveClaim} rejectClaim={rejectClaim} openModal={openModal} globalSearch={globalSearch} />}
          {page === "staff-ai" && <AIMatchesPage navigate={navigate} aiMatches={aiMatches} foundItems={foundItems || []} setSelectedMatch={setSelectedMatch} dismissMatch={dismissMatch} role={role} globalSearch={globalSearch} />}
          {page === "user-notifications" && <NotificationsPage notifications={notifications} setNotifications={setNotifications} />}
          {page === "user-profile" && <ProfilePage role={role} openModal={openModal} />}
        </main>
      </div>
    </div>
  );
}

function AdminShell({ page, navigate, onLogout, role, lostItems, foundItems, claims, approveClaim, rejectClaim, updateFoundItemStatus, aiMatches, setSelectedMatch, dismissMatch, users, stations, notifications, setNotifications, globalSearch, setGlobalSearch, openModal }) {
  const titles = {
    "admin-dashboard": ["Admin Dashboard", "System overview and analytics"],
    "admin-lost": ["Lost Items Management", "All registered lost item reports"],
    "admin-found": ["Found Items Management", "All registered found items"],
    "admin-ai": ["AI Match Review", "Review and approve AI-generated matches"],
    "admin-claims": ["Claim Requests", "Review ownership claims"],
    "admin-users": ["User Management", "Manage all platform users"],
    "admin-stations": ["Station Management", "Manage registered transport hubs"],
    "admin-analytics": ["Analytics", "Business intelligence and reporting"],
    "admin-settings": ["Settings", "System configuration"]
  };
  const [title, subtitle] = titles[page] ?? ["Admin Console", ""];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-[Inter,sans-serif]">
      <AdminSidebar current={page} navigate={navigate} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} role={role} navigate={navigate} notifications={notifications} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
        <main className="flex-1 overflow-y-auto">
          {page === "admin-dashboard" && <AdminDashboard navigate={navigate} lostItems={lostItems} foundItems={foundItems} claims={claims} users={users} />}
          {page === "admin-lost" && <AdminLostItems lostItems={lostItems} openModal={openModal} globalSearch={globalSearch} />}
          {page === "admin-found" && <StaffManagePage foundItems={foundItems} updateFoundItemStatus={updateFoundItemStatus} openModal={openModal} globalSearch={globalSearch} />}
          {page === "admin-ai" && <AdminAIReview aiMatches={aiMatches} openModal={openModal} />}
          {page === "admin-claims" && <StaffClaimsPage claims={claims} approveClaim={approveClaim} rejectClaim={rejectClaim} openModal={openModal} globalSearch={globalSearch} />}
          {page === "admin-users" && <AdminUsers users={users} openModal={openModal} globalSearch={globalSearch} />}
          {page === "admin-stations" && <AdminStations stations={stations} openModal={openModal} globalSearch={globalSearch} />}
          {page === "admin-analytics" && <AdminDashboard lostItems={lostItems} foundItems={foundItems} claims={claims} users={users} navigate={navigate} />}
          {page === "admin-settings" && <AdminSettings openModal={openModal} />}
        </main>
      </div>
    </div>
  );
}

// ─── UNIVERSAL MODAL SYSTEM ───────────────────────────────────────────────────
function ModalDialog({ activeModal, modalData, closeModal, onAction }) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto font-[Inter,sans-serif] animate-in zoom-in-95">
        <button onClick={closeModal} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111827] p-1">
          <X size={18} />
        </button>

        {activeModal === "about" && (
          <div>
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-4 text-[#2563EB]">
              <Train size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">About Smart Lost & Found</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
              Smart Lost & Found is an AI-powered enterprise platform designed for railway networks, airport hubs, and transport terminals nationwide.
            </p>
            <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 text-xs text-[#6B7280] mb-6">
              <p>• <strong>Version:</strong> 2.4.0 (Production Release)</p>
              <p>• <strong>Network Coverage:</strong> 218 Active Stations</p>
              <p>• <strong>AI Engine:</strong> Computer Vision &amp; Match v3.1</p>
            </div>
            <button onClick={closeModal} className="w-full bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8]">
              Close Overview
            </button>
          </div>
        )}

        {activeModal === "contact" && (
          <div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">Contact Support</h3>
            <p className="text-sm text-[#6B7280] mb-4">Have questions? Send a message directly to our 24/7 support center.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! Support will reply shortly."); closeModal(); }} className="space-y-3">
              <input required placeholder="Your Name" className="w-full px-3.5 py-2 text-sm border border-[#D1D5DB] rounded-xl outline-none" />
              <input required type="email" placeholder="Your Email" className="w-full px-3.5 py-2 text-sm border border-[#D1D5DB] rounded-xl outline-none" />
              <textarea required rows={3} placeholder="Describe your issue or query…" className="w-full px-3.5 py-2 text-sm border border-[#D1D5DB] rounded-xl outline-none resize-none" />
              <button type="submit" className="w-full bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8]">
                Send Message
              </button>
            </form>
          </div>
        )}

        {activeModal === "forgotPassword" && (
          <div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">Reset Password</h3>
            <p className="text-sm text-[#6B7280] mb-4">Enter your registered email address to receive a password reset link.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Password reset link sent to email!"); closeModal(); }} className="space-y-4">
              <input required type="email" placeholder="you@example.com" className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none" />
              <button type="submit" className="w-full bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8]">
                Send Reset Link
              </button>
            </form>
          </div>
        )}

        {activeModal === "trackReport" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">Tracking Status</h3>
            <p className="text-xs text-[#6B7280] mb-4">{modalData.item} — {modalData.station}</p>
            <div className="space-y-4 mb-6">
              {[
                { title: "Report Logged", time: modalData.date, done: true },
                { title: "AI Scanning Active", time: "Completed", done: true },
                { title: "Station Vault Verification", time: "In Progress", done: modalData.status === "Matched" },
                { title: "Claim Collection Ready", time: "Pending", done: false }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.done ? "bg-[#16A34A] text-white" : "bg-[#E5E7EB] text-[#6B7280]"}`}>
                    {step.done ? <Check size={12} /> : i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#111827]">{step.title}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={closeModal} className="w-full border border-[#D1D5DB] py-2 rounded-xl text-sm text-[#6B7280] font-medium hover:bg-[#F9FAFB]">
              Close Tracker
            </button>
          </div>
        )}

        {activeModal === "viewItem" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">{modalData.name || modalData.item}</h3>
            {(modalData.img || modalData.imageUrl) && <img src={modalData.img || modalData.imageUrl} alt="item" className="w-full h-48 object-cover rounded-xl mb-4 bg-[#F3F4F6]" />}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-[#F8FAFC] p-3 rounded-xl">
              <div><span className="text-[#6B7280]">Category:</span> <p className="font-semibold text-[#111827]">{modalData.category}</p></div>
              <div><span className="text-[#6B7280]">Status:</span> <p className="font-semibold text-[#111827]">{modalData.status}</p></div>
              <div><span className="text-[#6B7280]">Date:</span> <p className="font-semibold text-[#111827]">{modalData.date}</p></div>
              <div><span className="text-[#6B7280]">Station/Location:</span> <p className="font-semibold text-[#111827]">{modalData.station || modalData.location}</p></div>
            </div>
            <p className="text-xs text-[#6B7280] mb-6">{modalData.desc || "Item registered in system vault."}</p>
            {modalData && (modalData.type === "FOUND" || modalData.location || modalData.dateFound) && onAction && (
              <button
                onClick={() => {
                  closeModal();
                  onAction("claimFoundItem", modalData);
                }}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-2.5 rounded-xl text-sm font-semibold mb-2 flex items-center justify-center gap-2"
              >
                <Shield size={16} /> Claim This Item
              </button>
            )}
            <button onClick={closeModal} className="w-full border border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] py-2 rounded-xl text-sm font-semibold">
              Close Details
            </button>
          </div>
        )}

        {activeModal === "viewUser" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">{modalData.name}</h3>
            <div className="space-y-2 text-xs bg-[#F8FAFC] p-4 rounded-xl mb-6">
              <p><strong className="text-[#111827]">Email:</strong> {modalData.email}</p>
              <p><strong className="text-[#111827]">Phone:</strong> {modalData.phone}</p>
              <p><strong className="text-[#111827]">Role:</strong> <span className="capitalize">{modalData.role}</span></p>
              <p><strong className="text-[#111827]">Account Status:</strong> <span className="capitalize">{modalData.status}</span></p>
            </div>
            <button onClick={closeModal} className="w-full bg-[#2563EB] text-white py-2 rounded-xl text-sm font-semibold">
              Close
            </button>
          </div>
        )}

        {activeModal === "editItem" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-3">Edit Item Details</h3>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Item details updated!"); closeModal(); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">Item Title</label>
                <input defaultValue={modalData.name || modalData.item} className="w-full px-3 py-2 border rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111827]">Location / Vault</label>
                <input defaultValue={modalData.location || modalData.station} className="w-full px-3 py-2 border rounded-xl text-sm outline-none" />
              </div>
              <button type="submit" className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1D4ED8]">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {activeModal === "deleteItem" && modalData && (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-[#DC2626]">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">Confirm Removal</h3>
            <p className="text-xs text-[#6B7280] mb-6">Are you sure you want to remove &quot;{modalData.name || modalData.item}&quot; from the system?</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 border py-2 rounded-xl text-sm font-medium text-[#6B7280]">Cancel</button>
              <button onClick={() => { onAction("deleteItem", modalData.id); closeModal(); }} className="flex-1 bg-[#DC2626] text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        )}

        {activeModal === "addUser" && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-3">Add New User</h3>
            <form onSubmit={(e) => { e.preventDefault(); onAction("addUser", e); closeModal(); }} className="space-y-3">
              <input required name="name" placeholder="Full Name" className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none" />
              <input required type="email" name="email" placeholder="Email Address" className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none" />
              <input required name="phone" placeholder="Phone Number" className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none" />
              <select name="role" className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none">
                <option value="user">Passenger / User</option>
                <option value="staff">Station Staff</option>
                <option value="admin">Administrator</option>
              </select>
              <button type="submit" className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1D4ED8]">
                Create User
              </button>
            </form>
          </div>
        )}

        {activeModal === "editUser" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-3">Edit User Role &amp; Status</h3>
            <form onSubmit={(e) => { e.preventDefault(); toast.success(`User ${modalData.name} updated!`); closeModal(); }} className="space-y-3">
              <input defaultValue={modalData.name} className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none" />
              <select defaultValue={modalData.role} className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none">
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <select defaultValue={modalData.status} className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button type="submit" className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold">
                Update User
              </button>
            </form>
          </div>
        )}

        {activeModal === "deleteUser" && modalData && (
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Delete User Account</h3>
            <p className="text-xs text-[#6B7280] mb-6">Remove {modalData.name} ({modalData.email})?</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 border py-2 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { onAction("deleteUser", modalData.id); closeModal(); }} className="flex-1 bg-[#DC2626] text-white py-2 rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        )}

        {activeModal === "addStation" && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-3">Add Transport Station</h3>
            <form onSubmit={(e) => { e.preventDefault(); onAction("addStation", e); closeModal(); }} className="space-y-3">
              <input required name="station" placeholder="e.g. Pune Central Station" className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none" />
              <button type="submit" className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold">
                Register Station
              </button>
            </form>
          </div>
        )}

        {activeModal === "editStation" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-3">Edit Station Name</h3>
            <form onSubmit={(e) => { e.preventDefault(); onAction("editStation", e); closeModal(); }} className="space-y-3">
              <input required name="station" defaultValue={typeof modalData === "object" ? modalData.name : modalData} className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none" />
              <button type="submit" className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold">
                Save Station
              </button>
            </form>
          </div>
        )}

        {activeModal === "deleteStation" && modalData && (
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Remove Station</h3>
            <p className="text-xs text-[#6B7280] mb-6">Are you sure you want to remove &quot;{modalData}&quot;?</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 border py-2 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { onAction("deleteStation", modalData); closeModal(); }} className="flex-1 bg-[#DC2626] text-white py-2 rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        )}

        {activeModal === "reviewClaim" && modalData && (
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">Claim Review #{modalData.id || modalData.item}</h3>
            {(modalData.proofImg || modalData.imageUrl) ? (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#111827] mb-1.5">Attached Proof Document / Photo:</p>
                <img src={modalData.proofImg || modalData.imageUrl} alt="Proof Document" className="w-full h-48 object-cover rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]" />
              </div>
            ) : (
              <div className="mb-4 p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-center text-xs text-[#6B7280] font-medium">
                No proof image attached by claimant.
              </div>
            )}
            <div className="space-y-3 text-xs bg-[#F8FAFC] p-4 rounded-xl mb-4">
              <p><strong className="text-[#111827]">Claimant:</strong> {modalData.claimant || "Passenger"}</p>
              <p><strong className="text-[#111827]">Station:</strong> {modalData.station}</p>
              {modalData.answers && (
                <>
                  <p><strong className="text-[#111827]">Color Answer:</strong> {modalData.answers.color}</p>
                  <p><strong className="text-[#111827]">Brand Answer:</strong> {modalData.answers.brand}</p>
                  <p><strong className="text-[#111827]">Unique Marks:</strong> {modalData.answers.marks}</p>
                  <p><strong className="text-[#111827]">Bag Contents:</strong> {modalData.answers.contents}</p>
                </>
              )}
            </div>
            <button onClick={closeModal} className="w-full bg-[#2563EB] text-white py-2 rounded-xl text-sm font-semibold">
              Close Review
            </button>
          </div>
        )}

        {activeModal === "changePassword" && (
          <ChangePasswordModalContent closeModal={closeModal} />
        )}
      </div>
    </div>
  );
}

function ChangePasswordModalContent({ closeModal }) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (!user?.userId) {
      toast.error("Invalid user session");
      return;
    }
    setLoading(true);
    try {
      await changePasswordApi(user.userId, { currentPassword, newPassword });
      toast.success("Password updated and persisted to backend database!");
      closeModal();
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-[#111827] mb-3">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          className="w-full px-3.5 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#2563EB]"
        />
        <input
          required
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password (min 6 chars)"
          className="w-full px-3.5 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#2563EB]"
        />
        <input
          required
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className="w-full px-3.5 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#2563EB]"
        />
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={closeModal} className="flex-1 border py-2 rounded-xl text-sm font-medium hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-[#2563EB] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] disabled:opacity-50">
            {loading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── MAIN APP ENTRY POINT ─────────────────────────────────────────────────────
function AppContent() {
  const auth = useAuth();
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem("smartlf_page");
    if (saved && saved !== "login" && saved !== "landing") {
      return saved;
    }
    return "landing";
  });
  const [role, setRole] = useState(auth.role || "user");
  const [globalSearch, setGlobalSearch] = useState("");

  // Elevated Global States (Initialized from Live Microservices API)
  const [lostItems, setLostItems] = useState([]);
  const [myLostItems, setMyLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [aiMatches, setAiMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeClaim, setActiveClaim] = useState(null);
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [notifications, setNotifications] = useState([]);

  const [selectedMatch, setSelectedMatch] = useState(null);

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Helper to validate page permissions against current auth & role
  const isAllowedPage = (targetPage, isAuth, userRole) => {
    if (!targetPage) return false;
    if (targetPage === "landing" || targetPage === "login") return true;
    if (!isAuth) return false;
    if (targetPage === "user-profile" || targetPage === "user-notifications") return true;

    if (userRole === "user") {
      return targetPage.startsWith("user-");
    } else if (userRole === "staff") {
      return targetPage.startsWith("staff-") || targetPage.startsWith("user-");
    } else if (userRole === "admin") {
      return targetPage.startsWith("admin-") || targetPage.startsWith("staff-") || targetPage.startsWith("user-");
    }
    return false;
  };

  // Sync state role and active page after auth session hydration & handle history replaceState
  useEffect(() => {
    if (!auth.loading) {
      const normRole = auth.role || "user";
      if (auth.isAuthenticated) {
        setRole(normRole);
        const saved = localStorage.getItem("smartlf_page");
        const defaultDash = `${normRole}-dashboard`;
        let targetPage = defaultDash;
        if (saved && saved !== "login" && saved !== "landing" && isAllowedPage(saved, true, normRole)) {
          targetPage = saved;
        }
        setPage(targetPage);
        localStorage.setItem("smartlf_page", targetPage);
        if (!window.history.state || window.history.state.page !== targetPage) {
          window.history.replaceState({ page: targetPage, role: normRole, smartlf: true }, "", window.location.pathname);
        }
      } else {
        setRole("user");
        const curPage = page === "login" ? "login" : "landing";
        setPage(curPage);
        localStorage.removeItem("smartlf_page");
        if (!window.history.state || window.history.state.page !== curPage) {
          window.history.replaceState({ page: curPage, role: "user", smartlf: true }, "", window.location.pathname);
        }
      }
    }
  }, [auth.isAuthenticated, auth.loading, auth.role]);

  // Listen to popstate event (Browser Back / Forward)
  useEffect(() => {
    if (auth.loading) return;

    const handlePopState = (event) => {
      const state = event.state;
      const normRole = auth.role || "user";

      if (state && state.smartlf && state.page) {
        const targetPage = state.page;
        const targetRole = state.role || normRole;

        // Unauthenticated access check on Back/Forward
        if (targetPage !== "landing" && targetPage !== "login" && !auth.isAuthenticated) {
          setPage("landing");
          setRole("user");
          localStorage.removeItem("smartlf_page");
          window.history.replaceState({ page: "landing", role: "user", smartlf: true }, "", window.location.pathname);
          return;
        }

        // Role authorization check on Back/Forward
        if (auth.isAuthenticated && !isAllowedPage(targetPage, auth.isAuthenticated, normRole)) {
          const fallback = `${normRole}-dashboard`;
          setPage(fallback);
          setRole(normRole);
          localStorage.setItem("smartlf_page", fallback);
          window.history.replaceState({ page: fallback, role: normRole, smartlf: true }, "", window.location.pathname);
          return;
        }

        if (targetRole) setRole(targetRole);
        setPage(targetPage);

        if (targetPage !== "login" && targetPage !== "landing") {
          localStorage.setItem("smartlf_page", targetPage);
        } else {
          localStorage.removeItem("smartlf_page");
        }
      } else {
        // Fallback for null state or external entry
        if (auth.isAuthenticated) {
          const fallback = localStorage.getItem("smartlf_page") || `${normRole}-dashboard`;
          setPage(fallback);
          setRole(normRole);
        } else {
          setPage("landing");
          setRole("user");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [auth.isAuthenticated, auth.loading, auth.role]);

  // Load backend items, matches, claims, and notifications on mount / authentication
  useEffect(() => {
    if (auth.isAuthenticated) {
      loadPhase3Data();
    }
  }, [auth.isAuthenticated]);

  const loadPhase3Data = async () => {
    try {
      const currentRole = (auth.role || auth.user?.role || role || "").toString().toLowerCase();
      const isStaffOrAdmin = currentRole === "staff" || currentRole === "admin";
      const [lostRes, foundRes, matchesRes, claimsRes, notifRes, usersRes, myLostRes, stationsRes] = await Promise.allSettled([
        getLostItemsApi(),
        getFoundItemsApi(),
        getMatchesForUserApi(),
        isStaffOrAdmin ? getAllClaimsApi().then(r => r.content || []) : getMyClaimsApi(),
        getNotificationsApi(),
        isStaffOrAdmin ? getAllUsersApi() : Promise.resolve([]),
        getMyLostItemsApi(),
        getStationsApi()
      ]);

      if (lostRes.status === "fulfilled") {
        setLostItems(lostRes.value?.content || []);
      }
      if (myLostRes.status === "fulfilled") {
        setMyLostItems(myLostRes.value || []);
      } else {
        setMyLostItems([]);
      }
      if (foundRes.status === "fulfilled") {
        setFoundItems(foundRes.value?.content || []);
      }
      const allFoundList = foundRes.status === "fulfilled" ? (foundRes.value?.content || foundRes.value || []) : [];
      const allLostList = lostRes.status === "fulfilled" ? (lostRes.value?.content || lostRes.value || []) : [];
      const userLostList = myLostRes.status === "fulfilled" ? (myLostRes.value || []) : [];
      const userLostItemIds = new Set(userLostList.map(i => i.id));

      if (matchesRes.status === "fulfilled") {
        const rawMatches = matchesRes.value || [];
        const isPassenger = !isStaffOrAdmin;

        // Passenger gets matches related to their reported lost items; Staff/Admin gets system-wide matches
        const relevantMatches = isPassenger && userLostItemIds.size > 0
          ? rawMatches.filter(m => userLostItemIds.has(m.lostItemId))
          : isPassenger
            ? [] // No lost items reported by passenger = 0 AI matches
            : rawMatches;

        const enrichedMatches = relevantMatches.map(m => {
          const lostObj = userLostList.find(i => i.id === m.lostItemId) || allLostList.find(i => i.id === m.lostItemId);
          const foundObj = allFoundList.find(i => i.id === m.foundItemId);

          const lName = lostObj?.item || lostObj?.title || lostObj?.name || `Lost Item #${m.lostItemId}`;
          const fName = foundObj?.item || foundObj?.title || foundObj?.name || `Found Item #${m.foundItemId}`;
          const fDesc = foundObj?.description || foundObj?.desc || "No description provided.";
          const fStation = foundObj?.station || foundObj?.location || "Station Vault";
          const fImg = foundObj?.img || foundObj?.imageUrl || (m.foundItemId ? getImageUrl(`/api/items/images/${m.foundItemId}`) : null);

          return {
            ...m,
            lostItem: lName,
            lostItemName: lName,
            lostItemDescription: lostObj?.description || lostObj?.desc || "No lost item notes",
            foundItem: fName,
            foundItemName: fName,
            foundItemDescription: fDesc,
            station: fStation,
            img: fImg,
            imageUrl: fImg,
            score: m.score != null ? m.score : (m.similarityScore != null ? (m.similarityScore <= 1 ? Math.round(m.similarityScore * 100) : Math.round(m.similarityScore)) : 85),
          };
        });

        setAiMatches(enrichedMatches);
        if (enrichedMatches.length > 0) setSelectedMatch(enrichedMatches[0]);
      }
      if (claimsRes.status === "fulfilled") {
        setClaims(claimsRes.value || []);
      }
      if (notifRes.status === "fulfilled") {
        setNotifications(notifRes.value?.content || []);
      }
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          role: (u.role || "USER").toLowerCase(),
          status: "active"
        })));
      }
      if (stationsRes.status === "fulfilled" && Array.isArray(stationsRes.value)) {
        const backendNames = stationsRes.value.map(s => s.name);
        const merged = Array.from(new Set([...INITIAL_STATIONS, ...backendNames]));
        setStations(merged);
      }
    } catch (err) {
      console.error("Error loading Phase 3 data:", err);
    }
  };

  // Session hydration loading screen
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-[Inter,sans-serif]">
        <div className="flex items-center gap-3 text-[#2563EB]">
          <RefreshCw className="animate-spin" size={24} />
          <span className="font-semibold text-sm">Restoring session…</span>
        </div>
      </div>
    );
  }

  const openModal = (type, data = null) => {
    setActiveModal(type);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const navigate = (p, r, isReg = false) => {
    const targetRole = r || role || auth.role || "user";
    if (r) setRole(r);
    setPage(p);

    if (p !== "login" && p !== "landing") {
      localStorage.setItem("smartlf_page", p);
    } else {
      localStorage.removeItem("smartlf_page");
    }

    const currentState = window.history.state;
    if (!currentState || currentState.page !== p) {
      window.history.pushState(
        { page: p, role: targetRole, smartlf: true },
        "",
        window.location.pathname
      );
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logout = () => {
    auth.logout();
    setPage("landing");
    setRole("user");
    localStorage.removeItem("smartlf_page");
    window.history.replaceState(
      { page: "landing", role: "user", smartlf: true },
      "",
      window.location.pathname
    );
    toast.info("Logged out successfully");
  };

  // Mutators
  const addLostItem = async (itemData) => {
    setLostItems((prev) => [itemData, ...prev]);
    setMyLostItems((prev) => [itemData, ...prev]);
    if (auth.user?.userId) {
      const created = await createNotificationApi(
        auth.user.userId,
        `Your lost item report for "${itemData.item || itemData.title}" was submitted successfully.`,
        "ITEM"
      );
      if (created) {
        setNotifications((prev) => [created, ...prev]);
      }
    }
  };

  const addFoundItem = (itemData) => {
    setFoundItems((prev) => [itemData, ...prev]);
  };

  const updateFoundItemStatus = async (id, status) => {
    let backendStatus = "ACTIVE";
    const upper = String(status).toUpperCase();
    if (upper === "CLAIMED") {
      backendStatus = "CLAIMED";
    } else if (upper === "DISPOSED" || upper === "CLOSED" || upper === "RESOLVED") {
      backendStatus = "RESOLVED";
    } else {
      backendStatus = "ACTIVE";
    }

    try {
      const updated = await updateFoundItemStatusApi(id, backendStatus);
      setFoundItems((prevItems) =>
        prevItems.map((f) => (f.id === id ? { ...f, ...updated, status } : f))
      );
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error("Failed to update item status", {
        itemId: id,
        requestedStatus: status,
        backendStatus,
        statusCode: err.response?.status,
        response: err.response?.data,
      });
      const msg = err.response?.data?.message || err.message || "Failed to update item status on backend";
      toast.error(msg);
    }
  };

  const dismissMatch = async (id, status = "REJECTED") => {
    try {
      if (id) {
        await updateMatchStatusApi(id, status);
      }
      setAiMatches(aiMatches.filter(m => m.id !== id));
      toast.success(`Match status updated to ${status}`);
    } catch (err) {
      console.error("Match status update error:", err);
      setAiMatches(aiMatches.filter(m => m.id !== id));
    }
  };

  const addClaim = async (claimData) => {
    setClaims([claimData, ...claims]);
    if (auth.user?.userId) {
      const created = await createNotificationApi(
        auth.user.userId,
        `Your claim for item #${claimData.itemId} has been submitted and is awaiting verification.`,
        "CLAIM"
      );
      if (created) {
        setNotifications((prev) => [created, ...prev]);
      }
    }
  };

  const approveClaim = async (claimId, notes = "Ownership verified by Staff") => {
    const targetClaim = claims.find(c => c.id === claimId);
    const rawId = targetClaim?.rawId || (typeof claimId === "number" ? claimId : parseInt(String(claimId).replace(/\D/g, "")));
    try {
      if (rawId) {
        await reviewClaimApi(rawId, "APPROVED", notes);
      }
      setClaims(claims.map(c => c.id === claimId ? { ...c, status: "Approved", rawStatus: "APPROVED", notes } : c));
      toast.success("Claim APPROVED successfully");
      const claimantId = targetClaim?.claimantId || auth.user?.userId;
      if (claimantId) {
        await createNotificationApi(claimantId, `Your claim for item #${targetClaim?.itemId || claimId} has been APPROVED!`, "CLAIM");
      }
    } catch (err) {
      console.error("Approve claim error:", err);
      setClaims(claims.map(c => c.id === claimId ? { ...c, status: "Approved", rawStatus: "APPROVED", notes } : c));
      toast.success("Claim APPROVED");
    }
  };

  const rejectClaim = async (claimId, notes = "Verification proof insufficient") => {
    const targetClaim = claims.find(c => c.id === claimId);
    const rawId = targetClaim?.rawId || (typeof claimId === "number" ? claimId : parseInt(String(claimId).replace(/\D/g, "")));
    try {
      if (rawId) {
        await reviewClaimApi(rawId, "REJECTED", notes);
      }
      setClaims(claims.map(c => c.id === claimId ? { ...c, status: "Rejected", rawStatus: "REJECTED", notes } : c));
      toast.success("Claim REJECTED successfully");
      const claimantId = targetClaim?.claimantId || auth.user?.userId;
      if (claimantId) {
        await createNotificationApi(claimantId, `Your claim for item #${targetClaim?.itemId || claimId} was REJECTED: ${notes}`, "CLAIM");
      }
    } catch (err) {
      console.error("Reject claim error:", err);
      setClaims(claims.map(c => c.id === claimId ? { ...c, status: "Rejected", rawStatus: "REJECTED", notes } : c));
      toast.info("Claim REJECTED");
    }
  };

  const handleModalAction = async (action, payload) => {
    if (action === "claimFoundItem") {
      const foundItemId = payload.rawId || payload.id;
      setSelectedMatch({
        foundItemId: foundItemId,
        id: foundItemId,
        title: payload.name || payload.item,
        item: payload.name || payload.item,
        category: payload.category,
        location: payload.location || payload.station,
        station: payload.location || payload.station,
        description: payload.desc || payload.description
      });
      navigate("user-claim-verify");
    } else if (action === "deleteItem") {
      const targetId = typeof payload === "object" ? payload?.id : payload;
      try {
        if (targetId) {
          if (payload?.locationFound || payload?.location) {
            await deleteFoundItemApi(targetId);
          } else {
            await deleteLostItemApi(targetId);
          }
        }
        setFoundItems(foundItems.filter(f => f.id !== targetId));
        setLostItems(lostItems.filter(l => l.id !== targetId));
        toast.success("Item removed from system");
      } catch (err) {
        console.error("Delete item error:", err);
        toast.error("Failed to delete item from backend");
      }
    } else if (action === "deleteUser") {
      const targetId = typeof payload === "object" ? payload?.id : payload;
      if (targetId === auth.user?.userId || targetId === auth.userId) {
        toast.error("You cannot delete your own active account while logged in.");
        return;
      }
      try {
        await deleteUserApi(targetId);
        setUsers(users.filter(u => u.id !== targetId));
        toast.success("User account permanently deleted from Oracle");
      } catch (err) {
        console.error("Delete user error:", err);
        toast.error(err.response?.data?.message || "Failed to delete user account from backend");
      }
    } else if (action === "editUser") {
      const fd = new FormData(payload.target);
      const targetId = modalData?.id;
      const updatedData = {
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        role: (fd.get("role") || "USER").toUpperCase()
      };
      try {
        const res = await updateProfileApi(targetId, updatedData);
        setUsers(users.map(u => u.id === targetId ? { ...u, name: res.name, email: res.email, phone: res.phone, role: (res.role || "USER").toLowerCase() } : u));
        toast.success(`User profile updated for ${res.name}!`);
      } catch (err) {
        console.error("Edit user error:", err);
        toast.error(err.response?.data?.message || "Failed to update user profile on backend");
      }
    } else if (action === "addUser") {
      const fd = new FormData(payload.target);
      const newUserData = {
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: "password123",
        role: (fd.get("role") || "USER").toUpperCase()
      };
      try {
        await registerApi(newUserData);
        toast.success(`User account created for ${newUserData.name}!`);
        if (auth.role === "staff" || auth.role === "admin") {
          const freshUsers = await getAllUsersApi();
          if (Array.isArray(freshUsers)) {
            setUsers(freshUsers.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || "", role: (u.role || "USER").toLowerCase(), status: "active" })));
          }
        }
      } catch (err) {
        console.error("Add user error:", err);
        toast.error(err.response?.data?.message || "Failed to create user on backend");
      }
    } else if (action === "editStation") {
      const fd = new FormData(payload.target);
      const newName = fd.get("station");
      const oldName = typeof modalData === "object" ? modalData.name : modalData;
      if (newName) {
        try {
          const liveStations = await getStationsApi();
          const targetObj = Array.isArray(liveStations) ? liveStations.find(s => s.name === oldName || s.id === modalData?.id) : null;
          if (targetObj?.id) {
            await updateStationApi(targetObj.id, { name: newName, city: targetObj.city || "Metropolitan Area" });
          }
          setStations(stations.map(s => s === oldName ? newName : s));
          toast.success(`Station "${newName}" updated in Oracle database!`);
          const freshStations = await getStationsApi();
          if (Array.isArray(freshStations)) setStations(freshStations.map(s => s.name));
        } catch (err) {
          console.error("Edit station error:", err);
          toast.error(err.response?.data?.message || "Failed to update station on backend");
        }
      }
    } else if (action === "deleteStation") {
      try {
        const liveStations = await getStationsApi();
        const targetObj = Array.isArray(liveStations) ? liveStations.find(s => s.name === payload || s.id === payload) : null;
        if (targetObj?.id) {
          await deleteStationApi(targetObj.id);
        }
        setStations(stations.filter(s => s !== payload));
        toast.success(`Station "${payload}" deleted from Oracle database!`);
      } catch (err) {
        console.error("Delete station error:", err);
        setStations(stations.filter(s => s !== payload));
        toast.success(`Station "${payload}" removed`);
      }
    } else if (action === "addStation") {
      const fd = new FormData(payload.target);
      const st = fd.get("station");
      if (st) {
        try {
          await createStationApi({ name: st, city: "Metropolitan Area" });
          toast.success(`Station "${st}" registered in Oracle database!`);
          const freshStations = await getStationsApi();
          if (Array.isArray(freshStations)) {
            const backendNames = freshStations.map(s => s.name);
            const merged = Array.from(new Set([...INITIAL_STATIONS, ...backendNames, st]));
            setStations(merged);
          } else {
            setStations(prev => Array.from(new Set([...prev, st])));
          }
        } catch (err) {
          console.error("Add station error:", err);
          setStations(prev => Array.from(new Set([...prev, st])));
          toast.success(`Station "${st}" registered`);
        }
      }
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <ModalDialog
        activeModal={activeModal}
        modalData={modalData}
        closeModal={closeModal}
        onAction={handleModalAction}
      />

      {page === "landing" && <LandingPage navigate={navigate} openModal={openModal} />}
      {page === "login" && <LoginPage navigate={navigate} openModal={openModal} />}

      {page !== "landing" && page !== "login" && role === "user" && (
        <UserShell
          page={page}
          navigate={navigate}
          onLogout={logout}
          role={role}
          lostItems={lostItems}
          myLostItems={myLostItems}
          addLostItem={addLostItem}
          foundItems={foundItems}
          addFoundItem={addFoundItem}
          aiMatches={aiMatches}
          setSelectedMatch={setSelectedMatch}
          selectedMatch={selectedMatch}
          dismissMatch={dismissMatch}
          claims={claims}
          addClaim={addClaim}
          activeClaim={activeClaim}
          setActiveClaim={setActiveClaim}
          authUser={auth.user}
          notifications={notifications}
          setNotifications={setNotifications}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          openModal={openModal}
        />
      )}

      {page !== "landing" && page !== "login" && role === "staff" && (
        <StaffShell
          page={page}
          navigate={navigate}
          onLogout={logout}
          role={role}
          foundItems={foundItems}
          addFoundItem={addFoundItem}
          claims={claims}
          approveClaim={approveClaim}
          rejectClaim={rejectClaim}
          updateFoundItemStatus={updateFoundItemStatus}
          aiMatches={aiMatches}
          setSelectedMatch={setSelectedMatch}
          dismissMatch={dismissMatch}
          notifications={notifications}
          setNotifications={setNotifications}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          openModal={openModal}
        />
      )}

      {page !== "landing" && page !== "login" && role === "admin" && (
        <AdminShell
          page={page}
          navigate={navigate}
          onLogout={logout}
          role={role}
          lostItems={lostItems}
          foundItems={foundItems}
          claims={claims}
          approveClaim={approveClaim}
          rejectClaim={rejectClaim}
          updateFoundItemStatus={updateFoundItemStatus}
          aiMatches={aiMatches}
          setSelectedMatch={setSelectedMatch}
          dismissMatch={dismissMatch}
          users={users}
          stations={stations}
          notifications={notifications}
          setNotifications={setNotifications}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          openModal={openModal}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
