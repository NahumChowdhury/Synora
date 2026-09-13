"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Auth state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "team" | "chat" | "profile" | "admin">("tasks");

  // Data states
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamPosts, setTeamPosts] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [featureSettings, setFeatureSettings] = useState<any>(null);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedTeamPost, setSelectedTeamPost] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Form inputs
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "OTHER", requirements: "", budget: "", deadline: "" });
  const [taskApplyMessage, setTaskApplyMessage] = useState("");

  // Expanded Team Match Form State
  const [newTeamPost, setNewTeamPost] = useState({
    title: "",
    category: "ACADEMIC",
    subCategory: "University Project",
    description: "",
    lookingFor: "",
    requiredSkills: "",
    peopleNeeded: "1",
    deadline: "",
    department: "",
    preferredBatch: "",
    location: "",
    meetingPreference: "In-Person",
    experienceReq: "",
    contactInfo: "",
  });
  const [teamApplyMessage, setTeamApplyMessage] = useState("");

  const [taskRatingForm, setTaskRatingForm] = useState({ score: 5, comment: "" });
  const [profileForm, setProfileForm] = useState({ fullName: "", department: "", batch: "", skills: "", bio: "" });

  // Filters & Search
  const [taskFilter, setTaskFilter] = useState({ category: "ALL", status: "ALL", search: "" });

  // Team Match Filters
  const [teamFilter, setTeamFilter] = useState({
    category: "ALL",
    subCategory: "ALL",
    department: "ALL",
    status: "OPEN",
    search: "",
  });

  // Notifications/Alerts
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage("");
    }, 4000);
  };

  const fetchAuthUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.profile) {
          setProfileForm({
            fullName: data.profile.fullName || "",
            department: data.profile.department || "",
            batch: data.profile.batch || "",
            skills: data.profile.skills || "",
            bio: data.profile.bio || "",
          });
        }
      } else {
        localStorage.clear();
        router.push("/login");
      }
    } catch {
      localStorage.clear();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    try {
      let url = `http://localhost:5000/api/tasks?category=${taskFilter.category}&status=${taskFilter.status}`;
      if (taskFilter.search.trim()) {
        url += `&search=${encodeURIComponent(taskFilter.search.trim())}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeamPosts = async () => {
    const token = localStorage.getItem("token");
    try {
      let url = `http://localhost:5000/api/team?category=${teamFilter.category}&status=${teamFilter.status}`;
      if (teamFilter.department !== "ALL") {
        url += `&department=${encodeURIComponent(teamFilter.department)}`;
      }
      if (teamFilter.search.trim()) {
        url += `&search=${encodeURIComponent(teamFilter.search.trim())}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setTeamPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSingleTeamPost = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTeamPost(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");
    try {
      const sRes = await fetch("http://localhost:5000/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sRes.ok) {
        setFeatureSettings(await sRes.json());
      }
      const uRes = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (uRes.ok) {
        setAdminUsersList(await uRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuthUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "tasks") fetchTasks();
    if (activeTab === "team") fetchTeamPosts();
    if (activeTab === "chat") fetchConversations();
    if (activeTab === "admin" && user.role === "ADMIN") fetchAdminData();
  }, [user, activeTab, taskFilter, teamFilter]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Task Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      if (res.ok) {
        setShowTaskModal(false);
        setNewTask({ title: "", description: "", category: "OTHER", requirements: "", budget: "", deadline: "" });
        fetchTasks();
        showNotification("Task created successfully!");
      } else {
        showNotification(data.message, "error");
      }
    } catch {
      showNotification("Error creating task", "error");
    }
  };

  const handleApplyTask = async (taskId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: taskApplyMessage }),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      setTaskApplyMessage("");
      fetchTasks();
    } catch {
      showNotification("Application failed", "error");
    }
  };

  const handleSelectWorker = async (taskId: number, workerId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/select-worker`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workerId }),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      setSelectedTask(null);
      fetchTasks();
      setActiveTab("chat");
    } catch {
      showNotification("Failed to select worker", "error");
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      fetchTasks();
    } catch {
      showNotification("Failed to complete task", "error");
    }
  };

  const handleRateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${selectedTask.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(taskRatingForm),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      setShowRatingModal(false);
      fetchTasks();
    } catch {
      showNotification("Rating submission failed", "error");
    }
  };

  // Team Match Handlers
  const handleCreateTeamPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTeamPost),
      });
      const data = await res.json();
      if (res.ok) {
        setShowTeamModal(false);
        setNewTeamPost({
          title: "",
          category: "ACADEMIC",
          subCategory: "University Project",
          description: "",
          lookingFor: "",
          requiredSkills: "",
          peopleNeeded: "1",
          deadline: "",
          department: "",
          preferredBatch: "",
          location: "",
          meetingPreference: "In-Person",
          experienceReq: "",
          contactInfo: "",
        });
        fetchTeamPosts();
        showNotification("Opportunity published successfully!");
      } else {
        showNotification(data.message, "error");
      }
    } catch {
      showNotification("Error publishing opportunity", "error");
    }
  };

  const handleApplyTeamPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamPost) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/team/${selectedTeamPost.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: teamApplyMessage }),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      setTeamApplyMessage("");
      fetchSingleTeamPost(selectedTeamPost.id);
      fetchTeamPosts();
    } catch {
      showNotification("Application failed", "error");
    }
  };

  const handleUpdateApplicationStatus = async (appId: number, status: "ACCEPTED" | "REJECTED") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/team/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      if (selectedTeamPost) fetchSingleTeamPost(selectedTeamPost.id);
      if (status === "ACCEPTED") {
        fetchConversations();
      }
    } catch {
      showNotification("Status update failed", "error");
    }
  };

  const handleToggleTeamStatus = async (postId: number, currentStatus: string) => {
    const token = localStorage.getItem("token");
    const nextStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`http://localhost:5000/api/team/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      if (selectedTeamPost) fetchSingleTeamPost(selectedTeamPost.id);
      fetchTeamPosts();
    } catch {
      showNotification("Failed to toggle status", "error");
    }
  };

  const handleDeleteTeamPost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/team/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      setSelectedTeamPost(null);
      fetchTeamPosts();
    } catch {
      showNotification("Failed to delete post", "error");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      fetchAuthUser();
    } catch {
      showNotification("Profile update failed", "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !newMessageText.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessageText }),
      });
      if (res.ok) {
        setNewMessageText("");
        openConversation(activeConversation);
      }
    } catch {
      showNotification("Failed to send message", "error");
    }
  };

  const openConversation = async (conv: any) => {
    setActiveConversation(conv);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${conv.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBanUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      showNotification(data.message, res.ok ? "success" : "error");
      fetchAdminData();
    } catch {
      showNotification("Ban toggle failed", "error");
    }
  };

  const handleToggleFeature = async (featureName: string, currentValue: boolean) => {
    if (!featureSettings) return;
    const token = localStorage.getItem("token");
    const updated = { ...featureSettings, [featureName]: !currentValue };
    try {
      const res = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setFeatureSettings(data.settings);
      showNotification("Platform module setting updated!");
    } catch {
      showNotification("Settings update failed", "error");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white text-lg font-bold shadow-xs mb-3">
          S
        </div>
        <p className="text-slate-500 text-xs font-medium tracking-wide">Loading Synora Platform...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900 pb-16">

      {/* Floating Header Navbar (Matching Reference Image) */}
      <header className="sticky top-4 z-40 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs rounded-full px-5 py-3 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-base shadow-xs">
                S
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Synora</span>
            </button>
            <span className="hidden sm:inline-block bg-slate-100 text-slate-600 rounded-md px-2.5 py-0.5 text-[11px] font-bold border border-slate-200/60 uppercase tracking-wider">
              DIU Campus
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                {user?.email?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <span className="truncate max-w-[140px]">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-full border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">

        {/* Horizontal Navigation Tab Strip */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto custom-scrollbar pb-px">
            {[
              { id: "tasks", label: "Task Board", icon: "💼" },
              { id: "team", label: "Team Match & Opportunities", icon: "👥" },
              { id: "chat", label: "Messages", icon: "💬" },
              { id: "profile", label: "Profile", icon: "👤" },
              ...(user?.role === "ADMIN" ? [{ id: "admin", label: "Admin Panel", icon: "⚙️" }] : []),
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Notification Banner */}
        {statusMessage && (
          <div className={`p-3.5 border rounded-xl text-xs font-semibold flex justify-between items-center shadow-2xs ${
            statusType === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}>
            <span className="flex items-center gap-2">
              <span>{statusType === "success" ? "✅" : "⚠️"}</span>
              {statusMessage}
            </span>
            <button onClick={() => setStatusMessage("")} className="text-slate-400 hover:text-slate-600 px-2">✕</button>
          </div>
        )}

        {/* TAB 1: TASK BOARD */}
        {activeTab === "tasks" && (
          <div className="space-y-6">

            {/* Header & Filter Toolbar */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Task Marketplace</h2>
                <p className="text-xs text-slate-500 mt-0.5">Post tasks or find help while keeping worker identity private</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={taskFilter.search}
                  onChange={(e) => setTaskFilter({ ...taskFilter, search: e.target.value })}
                  className="bg-white border border-slate-300 text-xs text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-600 w-full sm:w-44"
                />

                <select
                  value={taskFilter.category}
                  onChange={(e) => setTaskFilter({ ...taskFilter, category: e.target.value })}
                  className="bg-white border border-slate-300 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PPT">PPT Creation</option>
                  <option value="ASSIGNMENT">Assignment Help</option>
                  <option value="PRESENTATION">Presentation Prep</option>
                  <option value="THESIS">Thesis Research</option>
                  <option value="DESIGN">Design Work</option>
                  <option value="CODING">Coding Help</option>
                  <option value="RESEARCH">Research Assistance</option>
                  <option value="OTHER">Other</option>
                </select>

                <select
                  value={taskFilter.status}
                  onChange={(e) => setTaskFilter({ ...taskFilter, status: e.target.value })}
                  className="bg-white border border-slate-300 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-2xs transition"
                >
                  + Post Task
                </button>
              </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tasks.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
                  No tasks available right now. Post a task to get started!
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {task.category}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          task.status === "OPEN" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          task.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{task.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-emerald-700 text-sm">{task.budget ? `৳${task.budget}` : "Negotiable"}</span>
                        <span className="text-slate-400 text-[11px] font-medium">{task.requesterAlias}</span>
                      </div>

                      <div className="flex gap-2">
                        {task.isRequester ? (
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
                          >
                            Manage Task ({task.applications?.length || 0})
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 2: TEAM MATCH & OPPORTUNITY NETWORK */}
        {activeTab === "team" && (
          <div className="space-y-6">

            {/* Header & Comprehensive Category Filter Toolbar */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-2xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Team Match & Opportunity Network</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Find student teammates for projects, clubs, startups, research, tours & competitions</p>
                </div>

                <button
                  onClick={() => setShowTeamModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition"
                >
                  + Post Opportunity
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {[
                  { id: "ALL", label: "All Opportunities" },
                  { id: "ACADEMIC", label: "Academic & Projects" },
                  { id: "CLUB", label: "Clubs & Competitions" },
                  { id: "STARTUP", label: "Startup & Business" },
                  { id: "TOUR", label: "Tours & Activities" },
                  { id: "SKILLS", label: "Skills & Collaboration" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTeamFilter({ ...teamFilter, category: cat.id })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      teamFilter.category === cat.id
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search & Secondary Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by title, skills, keywords..."
                  value={teamFilter.search}
                  onChange={(e) => setTeamFilter({ ...teamFilter, search: e.target.value })}
                  className="bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-600 flex-1 min-w-[200px]"
                />

                <select
                  value={teamFilter.department}
                  onChange={(e) => setTeamFilter({ ...teamFilter, department: e.target.value })}
                  className="bg-white border border-slate-300 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                >
                  <option value="ALL">All Departments</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="SWE">Software Engineering (SWE)</option>
                  <option value="EEE">Electrical (EEE)</option>
                  <option value="BBA">Business (BBA)</option>
                  <option value="ENGLISH">English</option>
                  <option value="OTHER">Other</option>
                </select>

                <select
                  value={teamFilter.status}
                  onChange={(e) => setTeamFilter({ ...teamFilter, status: e.target.value })}
                  className="bg-white border border-slate-300 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                >
                  <option value="OPEN">Open Only</option>
                  <option value="CLOSED">Closed Only</option>
                  <option value="ALL">All Status</option>
                </select>
              </div>
            </div>

            {/* Opportunities Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamPosts.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
                  No opportunities match your filter criteria. Be the first to post one!
                </div>
              ) : (
                teamPosts.map((post) => (
                  <div key={post.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">

                      {/* Top Badges */}
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {post.category}
                        </span>
                        {post.subCategory && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {post.subCategory}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug">{post.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{post.description}</p>

                      {/* Looking For snippet */}
                      {post.lookingFor && (
                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2.5 text-xs text-purple-900">
                          <span className="font-bold text-[11px] block text-purple-700">Looking For:</span>
                          <span className="text-slate-700 text-[11px] line-clamp-1">{post.lookingFor}</span>
                        </div>
                      )}

                      {/* Skills Chips */}
                      {post.requiredSkills && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.requiredSkills.split(",").map((sk: string, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {sk.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Creator Identity & Meta Footer */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{post.authorName}</span>
                          <span className="text-[11px] text-slate-500">{post.authorDepartment || "DIU Student"} {post.authorBatch ? `(Batch ${post.authorBatch})` : ""}</span>
                        </div>
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          👥 {post.peopleNeeded || 1} Needed
                        </span>
                      </div>

                      <button
                        onClick={() => fetchSingleTeamPost(post.id)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-2xs"
                      >
                        View Opportunity & Apply →
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MESSAGES */}
        {activeTab === "chat" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col md:flex-row h-[600px] overflow-hidden">
            {/* Left: Conversation List */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-900">Conversations</h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {conversations.length === 0 ? (
                  <p className="p-6 text-xs text-slate-400 italic text-center">No active conversations. Accept a team application or task to start chatting!</p>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation?.id === conv.id;
                    const otherUser = conv.otherUser || { fullName: "Student User", email: "User" };
                    return (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv)}
                        className={`w-full text-left p-4 hover:bg-slate-50 transition flex items-center gap-3 ${
                          isSelected ? "bg-purple-50/60 border-l-4 border-purple-600" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {otherUser.fullName?.charAt(0) || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{otherUser.fullName}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage || "Tap to chat..."}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Message Window */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
              {activeConversation ? (
                <>
                  <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{activeConversation.otherUser?.fullName || "Chat"}</h4>
                      <p className="text-[11px] text-slate-500">{activeConversation.otherUser?.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
                    {messages.map((m) => {
                      const isMe = m.senderId === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                            isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs"
                          }`}>
                            <p>{m.content}</p>
                            <span className="text-[9px] opacity-60 block text-right mt-1">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-600"
                    />
                    <button type="submit" className="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-slate-800 transition">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic p-6">
                  Select a conversation from the left to start messaging.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your verified DIU student information for Team Match and Task Marketplace</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">DIU Email (Verified)</label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, SWE, EEE, BBA"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 58"
                    value={profileForm.batch}
                    onChange={(e) => setProfileForm({ ...profileForm, batch: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Skills & Interests (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python, UI Design, Public Speaking"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bio / About Yourself</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of your academic interests and projects..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition"
              >
                Save Profile Details
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: ADMIN PANEL */}
        {activeTab === "admin" && user?.role === "ADMIN" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admin Moderation & Settings</h2>

              {/* Feature Settings Toggles */}
              {featureSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Task Marketplace</h4>
                      <p className="text-[11px] text-slate-500">Enable/disable task posting and applications</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeature("taskBoardEnabled", featureSettings.taskBoardEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${
                        featureSettings.taskBoardEnabled ? "bg-emerald-600" : "bg-slate-400"
                      }`}
                    >
                      {featureSettings.taskBoardEnabled ? "ACTIVE" : "DISABLED"}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Team Match Network</h4>
                      <p className="text-[11px] text-slate-500">Enable/disable opportunity posts and matching</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeature("teamMatchEnabled", featureSettings.teamMatchEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${
                        featureSettings.teamMatchEnabled ? "bg-purple-600" : "bg-slate-400"
                      }`}
                    >
                      {featureSettings.teamMatchEnabled ? "ACTIVE" : "DISABLED"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Registered DIU Students</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 font-bold">Email</th>
                      <th className="py-2.5 font-bold">Name</th>
                      <th className="py-2.5 font-bold">Role</th>
                      <th className="py-2.5 font-bold">Status</th>
                      <th className="py-2.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsersList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-semibold text-slate-900">{u.email}</td>
                        <td className="py-3 text-slate-600">{u.fullName || "N/A"}</td>
                        <td className="py-3 text-slate-600">{u.role}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {u.isBanned ? "BANNED" : "ACTIVE"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleBanUser(u.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              u.isBanned ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            }`}
                          >
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Create Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Post a Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 px-2">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Need assistance with CSE Lab assignment"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="PPT">PPT Creation</option>
                  <option value="ASSIGNMENT">Assignment Help</option>
                  <option value="PRESENTATION">Presentation Prep</option>
                  <option value="THESIS">Thesis Research</option>
                  <option value="DESIGN">Design Work</option>
                  <option value="CODING">Coding Help</option>
                  <option value="RESEARCH">Research Assistance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe task requirements..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Budget (BDT)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={newTask.budget}
                    onChange={(e) => setNewTask({ ...newTask, budget: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-2xs">Post Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Post Team Opportunity */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Post Opportunity</h3>
                <p className="text-[11px] text-slate-500">Find teammates, partners, or activity groups</p>
              </div>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600 px-2">✕</button>
            </div>

            <form onSubmit={handleCreateTeamPost} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Need 2 Teammates for National AI Hackathon"
                  value={newTeamPost.title}
                  onChange={(e) => setNewTeamPost({ ...newTeamPost, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category *</label>
                  <select
                    value={newTeamPost.category}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="ACADEMIC">Academic & Projects</option>
                    <option value="CLUB">Clubs & Competitions</option>
                    <option value="STARTUP">Startup & Business</option>
                    <option value="TOUR">Tours & Activities</option>
                    <option value="SKILLS">Skills & Collaboration</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sub-Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Thesis, Hackathon, Co-founder"
                    value={newTeamPost.subCategory}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, subCategory: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe the opportunity, goals, and details..."
                  value={newTeamPost.description}
                  onChange={(e) => setNewTeamPost({ ...newTeamPost, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">What are you looking for in a teammate?</label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated student with interest in Machine Learning"
                  value={newTeamPost.lookingFor}
                  onChange={(e) => setNewTeamPost({ ...newTeamPost, lookingFor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Required Skills / Interests</label>
                  <input
                    type="text"
                    placeholder="e.g. Python, React, Data Analysis"
                    value={newTeamPost.requiredSkills}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, requiredSkills: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">People Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={newTeamPost.peopleNeeded}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, peopleNeeded: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, SWE"
                    value={newTeamPost.department}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 58"
                    value={newTeamPost.preferredBatch}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, preferredBatch: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Meeting Preference</label>
                  <select
                    value={newTeamPost.meetingPreference}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, meetingPreference: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="In-Person">In-Person (Campus)</option>
                    <option value="Online">Online / Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Location / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Knowledge Tower / Online"
                    value={newTeamPost.location}
                    onChange={(e) => setNewTeamPost({ ...newTeamPost, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowTeamModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-2xs">Publish Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Opportunity Details & Applications */}
      {selectedTeamPost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl text-slate-900">

            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedTeamPost.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedTeamPost.status === "OPEN" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {selectedTeamPost.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mt-1">{selectedTeamPost.title}</h3>
              </div>
              <button onClick={() => setSelectedTeamPost(null)} className="text-slate-400 hover:text-slate-600 px-2 text-base">✕</button>
            </div>

            {/* Creator Identity Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{selectedTeamPost.authorName}</span>
                <span className="text-slate-500">{selectedTeamPost.authorDepartment} • Batch {selectedTeamPost.authorBatch || "N/A"}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">{selectedTeamPost.authorEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-amber-600 font-bold block">⭐ {selectedTeamPost.authorRating}</span>
                <span className="text-slate-500 text-[11px]">👥 {selectedTeamPost.peopleNeeded || 1} Needed</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Description</h4>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedTeamPost.description}</p>
              </div>

              {selectedTeamPost.lookingFor && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">What Creator is Looking For</h4>
                  <p className="bg-purple-50/60 text-purple-900 p-3 rounded-xl border border-purple-100">{selectedTeamPost.lookingFor}</p>
                </div>
              )}

              {selectedTeamPost.requiredSkills && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeamPost.requiredSkills.split(",").map((sk: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* IF NOT CREATOR: Application Form */}
            {!selectedTeamPost.isAuthor && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {selectedTeamPost.hasApplied ? (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex justify-between items-center">
                    <span>You have applied to this opportunity. Status: <strong className="uppercase">{selectedTeamPost.myApplicationStatus}</strong></span>
                  </div>
                ) : selectedTeamPost.status === "OPEN" ? (
                  <form onSubmit={handleApplyTeamPost} className="space-y-3">
                    <label className="block text-xs font-bold text-slate-900">Express Interest / Pitch Message</label>
                    <textarea
                      rows={2}
                      placeholder="Introduce yourself and explain why you're interested..."
                      value={teamApplyMessage}
                      onChange={(e) => setTeamApplyMessage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-600"
                    />
                    <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs">
                      Submit Interest
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-xl text-xs text-center">
                    This opportunity is closed for new applications.
                  </div>
                )}
              </div>
            )}

            {/* IF CREATOR: Review Applicants & Controls */}
            {selectedTeamPost.isAuthor && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-900">Applicants ({selectedTeamPost.applications?.length || 0})</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleTeamStatus(selectedTeamPost.id, selectedTeamPost.status)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200"
                    >
                      Toggle {selectedTeamPost.status === "OPEN" ? "Close" : "Open"}
                    </button>
                    <button
                      onClick={() => handleDeleteTeamPost(selectedTeamPost.id)}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedTeamPost.applications?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No applications received yet.</p>
                  ) : (
                    selectedTeamPost.applications?.map((app: any) => (
                      <div key={app.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900">{app.applicantName}</span>
                            <span className="text-[11px] text-slate-500 block">{app.applicantDepartment} (Batch {app.applicantBatch || "N/A"}) • {app.applicantEmail}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            app.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" :
                            app.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {app.message && <p className="text-slate-600 italic text-[11px]">"{app.message}"</p>}

                        {app.status === "PENDING" && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, "ACCEPTED")}
                              className="px-3 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-700"
                            >
                              Accept & Connect Chat
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, "REJECTED")}
                              className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg hover:bg-slate-300"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: View Task Details & Applicants */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar shadow-xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{selectedTask.category}</span>
                <h3 className="font-bold text-base text-slate-900 mt-1">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 px-2">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedTask.description}</p>

              <div className="flex justify-between text-xs pt-1">
                <span>Budget: <strong className="text-emerald-700 font-bold">{selectedTask.budget ? `৳${selectedTask.budget}` : "Negotiable"}</strong></span>
                <span>Requester: <strong className="text-slate-800">{selectedTask.requesterAlias}</strong></span>
              </div>
            </div>

            {!selectedTask.isRequester && selectedTask.status === "OPEN" && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <textarea
                  rows={2}
                  placeholder="Pitch why you're suited for this task..."
                  value={taskApplyMessage}
                  onChange={(e) => setTaskApplyMessage(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  onClick={() => handleApplyTask(selectedTask.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Submit Application
                </button>
              </div>
            )}

            {selectedTask.isRequester && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-xs text-slate-900">Task Applicants</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedTask.applications?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">No applications yet.</p>
                  ) : (
                    selectedTask.applications?.map((app: any) => (
                      <div key={app.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{app.applicantAlias}</span>
                          <span className="text-[10px] text-slate-400 block">Rating: ⭐ {app.applicantRating}</span>
                        </div>
                        {selectedTask.status === "OPEN" && (
                          <button
                            onClick={() => handleSelectWorker(selectedTask.id, app.applicantId)}
                            className="px-3 py-1 bg-slate-900 text-white font-bold text-[11px] rounded-lg"
                          >
                            Assign Task
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
