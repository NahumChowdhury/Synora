"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();

  // Auth state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat" | "profile" | "admin">("tasks");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (["tasks", "chat", "profile", "admin"].includes(requested || "")) {
      setActiveTab(requested as "tasks" | "chat" | "profile" | "admin");
    }
  }, []);


  // Data states
  const [tasks, setTasks] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [featureSettings, setFeatureSettings] = useState<any>(null);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [adminReports, setAdminReports] = useState<any[]>([]);

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: number; preview: string } | null>(null);
  const [reportForm, setReportForm] = useState({ reason: "HARASSMENT", details: "" });
  const [taskFeatureUnavailable, setTaskFeatureUnavailable] = useState(false);

  // Form inputs
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "OTHER", requirements: "", budget: "", deadline: "" });
  const [taskApplyMessage, setTaskApplyMessage] = useState("");

  const [taskRatingForm, setTaskRatingForm] = useState({ score: 5, comment: "" });
  const [profileForm, setProfileForm] = useState({ fullName: "", department: "", batch: "", skills: "", bio: "" });

  // Filters & Search
  const [taskFilter, setTaskFilter] = useState({ category: "ALL", status: "ALL", search: "" });

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
    try {
      const res = await apiFetch("/api/auth/verify");

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
        router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    } catch {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      let url = `/api/tasks?category=${taskFilter.category}&status=${taskFilter.status}`;
      if (taskFilter.search.trim()) {
        url += `&search=${encodeURIComponent(taskFilter.search.trim())}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setTaskFeatureUnavailable(false);
      } else if (res.status === 403) {
        setTasks([]);
        setTaskFeatureUnavailable(true);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const fetchSingleTask = async (id: number) => {
    try {
      const res = await apiFetch(`/api/tasks/${id}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setSelectedTask(data);
      else showNotification(data.message || "Task could not be opened", "error");
    } catch {
      showNotification("Task could not be opened", "error");
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await apiFetch("/api/chat/conversations", {

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
    try {
      const sRes = await apiFetch("/api/admin/settings", {

      });
      if (sRes.ok) {
        setFeatureSettings(await sRes.json());
      }
      const uRes = await apiFetch("/api/admin/users");
      if (uRes.ok) setAdminUsersList(await uRes.json());
      const rRes = await apiFetch("/api/admin/reports");
      if (rRes.ok) setAdminReports(await rRes.json());
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
    if (activeTab === "chat") fetchConversations();
    if (activeTab === "admin" && user.role === "ADMIN") fetchAdminData();
  }, [user, activeTab, taskFilter]);

  const handleLogout = async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } finally {
      router.replace("/login");
    }
  };

  // Task Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleSelectWorker = async (taskId: number, applicationId: number) => {
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/select-worker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
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

  const handleTaskStatus = async (taskId: number, status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      showNotification(data.message || "Task updated", res.ok ? "success" : "error");
      if (res.ok) {
        await fetchTasks();
        await fetchSingleTask(taskId);
      }
    } catch {
      showNotification("Task status update failed", "error");
    }
  };

  const handleRateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      const res = await apiFetch(`/api/tasks/${selectedTask.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    try {
      const res = await apiFetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessageText }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNewMessageText("");
        openConversation(activeConversation);
      } else {
        showNotification(data.message || "Message could not be sent", "error");
      }
    } catch {
      showNotification("Failed to send message", "error");
    }
  };

  const openConversation = async (conv: any) => {
    setActiveConversation(conv);
    try {
      const res = await apiFetch(`/api/chat/conversations/${conv.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setActiveConversation({ ...conv, ...data, otherUser: data.otherUser || conv.otherUser });
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification(data.message || "Conversation could not be opened", "error");
      }
    } catch {
      showNotification("Conversation could not be opened", "error");
    }
  };

  const handleToggleBlock = async () => {
    if (!activeConversation?.id) return;
    const isBlocked = Boolean(activeConversation.blockedByMe);
    if (!isBlocked && !confirm("Block this student? They will no longer be able to message you until you unblock them.")) return;
    try {
      const res = await apiFetch(`/api/chat/conversations/${activeConversation.id}/block`, { method: isBlocked ? "DELETE" : "POST" });
      const data = await res.json().catch(() => ({}));
      showNotification(data.message || (isBlocked ? "User unblocked" : "User blocked"), res.ok ? "success" : "error");
      if (res.ok) {
        await fetchConversations();
        await openConversation({ ...activeConversation, blockedByMe: !isBlocked });
      }
    } catch {
      showNotification("Block setting could not be updated", "error");
    }
  };

  const openReportMessage = (messageId: number, content: string) => {
    setReportForm({ reason: "HARASSMENT", details: "" });
    setReportTarget({ id: messageId, preview: content.slice(0, 180) });
  };

  const handleReportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;
    try {
      const res = await apiFetch(`/api/chat/messages/${reportTarget.id}/report`, {
        method: "POST",
        body: JSON.stringify(reportForm),
      });
      const data = await res.json().catch(() => ({}));
      showNotification(data.message || "Report submitted", res.ok ? "success" : "error");
      if (res.ok) setReportTarget(null);
    } catch {
      showNotification("Report could not be submitted", "error");
    }
  };

  const handleUpdateReport = async (reportId: number, status: "REVIEWED" | "DISMISSED" | "ACTION_TAKEN") => {
    try {
      const res = await apiFetch(`/api/admin/reports/${reportId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      const data = await res.json().catch(() => ({}));
      showNotification(data.message || "Report updated", res.ok ? "success" : "error");
      if (res.ok) fetchAdminData();
    } catch {
      showNotification("Report update failed", "error");
    }
  };

  const handleToggleBanUser = async (userId: number) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",

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
    const updated = { ...featureSettings, [featureName]: !currentValue };
    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
              { id: "tasks", label: "Task Marketplace", icon: "💼" },
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
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <button
                  onClick={() => setShowTaskModal(true)}
                  disabled={taskFeatureUnavailable}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-2xs transition"
                >
                  + Post Task
                </button>
              </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tasks.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
                  {taskFeatureUnavailable ? "Task Marketplace is temporarily disabled by an administrator." : "No tasks available right now. Post a task to get started!"}
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
                            onClick={() => fetchSingleTask(task.id)}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
                          >
                            Manage Task ({task.applicationsCount || 0})
                          </button>
                        ) : (
                          <button
                            onClick={() => fetchSingleTask(task.id)}
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

        {/* TAB 2: MESSAGES */}

        {activeTab === "chat" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col md:flex-row h-[72vh] min-h-[560px] md:h-[600px] overflow-hidden">
            {/* Left: Conversation List */}
            <div className="w-full md:w-1/3 max-h-56 md:max-h-none border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-900">Conversations</h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {conversations.length === 0 ? (
                  <p className="p-6 text-xs text-slate-400 italic text-center">No active conversations yet. A private conversation appears after a requester assigns a worker to a task.</p>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation?.id === conv.id;
                    const otherUser = conv.otherUser || { fullName: "Task participant" };
                    return (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv)}
                        className={`w-full text-left p-4 hover:bg-slate-50 transition flex items-center gap-3 ${
                          isSelected ? "bg-emerald-50/60 border-l-4 border-emerald-600" : ""
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
                  <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap gap-3 justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{activeConversation.otherUser?.fullName || "Chat"}</h4>
                      <p className="text-[11px] text-slate-500">
                        {`${activeConversation.contextTitle || "Task conversation"} • anonymous task identity`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBlock}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${activeConversation.blockedByMe ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-rose-700 border-rose-200"}`}
                    >
                      {activeConversation.blockedByMe ? "Unblock" : "Block"}
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
                    {messages.map((m) => {
                      const isMe = Boolean(m.isMe);
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[82%] md:max-w-[75%] p-3 rounded-2xl text-xs ${
                            isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              {!isMe && (
                                <button
                                  type="button"
                                  onClick={() => openReportMessage(m.id, m.content)}
                                  className="text-[9px] underline opacity-60 hover:opacity-100"
                                >
                                  Report
                                </button>
                              )}
                              <span className="text-[9px] opacity-60">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200 bg-white">
                    {(activeConversation.blockedByMe || activeConversation.blockedMe) ? (
                      <p className="p-3 text-center text-xs text-rose-700 bg-rose-50">Messaging is paused because one participant has blocked the other.</p>
                    ) : (
                      <>
                        <p className="px-3 pt-2 text-[10px] text-slate-500">Adult/sexual content, threats, harassment and spam are not allowed. Messages can be reported.</p>
                        <form onSubmit={handleSendMessage} className="p-3 pt-2 flex gap-2">
                          <input
                            type="text"
                            maxLength={2000}
                            placeholder="Type a message..."
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-600"
                          />
                          <button type="submit" className="bg-slate-900 text-white font-bold text-xs px-4 sm:px-5 py-2 rounded-xl hover:bg-slate-800 transition">
                            Send
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic p-6">
                  Select a conversation from the left to start messaging.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your verified DIU account details. Task Marketplace keeps participant identity anonymous inside task flows.</p>
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
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600"
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
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 58"
                    value={profileForm.batch}
                    onChange={(e) => setProfileForm({ ...profileForm, batch: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600"
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
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bio / About Yourself</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of your academic interests and projects..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600"
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

        {/* TAB 4: ADMIN PANEL */}
        {activeTab === "admin" && user?.role === "ADMIN" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admin Moderation & Settings</h2>

              {/* Feature Settings Toggles */}
              {featureSettings && (
                <div className="grid grid-cols-1 gap-4 pt-2">
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

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Message Safety Reports</h3>
                <p className="text-[11px] text-slate-500 mt-1">Review reports submitted from participant conversations.</p>
              </div>
              {adminReports.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No message reports.</p>
              ) : (
                <div className="space-y-3">
                  {adminReports.map((report) => (
                    <div key={report.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900">{report.reason} • {report.status}</div>
                        <div className="text-[10px] text-slate-500">{new Date(report.createdAt).toLocaleString()}</div>
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2 break-words">{report.message?.content}</p>
                      <p className="text-[10px] text-slate-500">Reporter: {report.reporter?.profile?.fullName || report.reporter?.email}</p>
                      {report.status === "OPEN" && (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleUpdateReport(report.id, "REVIEWED")} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold">Reviewed</button>
                          <button onClick={() => handleUpdateReport(report.id, "ACTION_TAKEN")} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold">Action Taken</button>
                          <button onClick={() => handleUpdateReport(report.id, "DISMISSED")} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold">Dismiss</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

            {selectedTask.canRate && (
              <div className="pt-3 border-t border-slate-100">
                <button onClick={() => setShowRatingModal(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl">Rate Task Participant</button>
              </div>
            )}

            {selectedTask.status === "COMPLETED" && selectedTask.hasRated && (
              <p className="pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold">Your rating for this task has been submitted.</p>
            )}

            {(selectedTask.isRequester || selectedTask.isWorker) && selectedTask.status !== "OPEN" && selectedTask.status !== "COMPLETED" && selectedTask.status !== "CANCELLED" && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {selectedTask.status === "ASSIGNED" && (
                  <button onClick={() => handleTaskStatus(selectedTask.id, "IN_PROGRESS")} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">Start Task</button>
                )}
                {selectedTask.status === "IN_PROGRESS" && (
                  <button onClick={() => handleTaskStatus(selectedTask.id, "COMPLETED")} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">Mark Completed</button>
                )}
                {selectedTask.isRequester && (
                  <button onClick={() => confirm("Cancel this task?") && handleTaskStatus(selectedTask.id, "CANCELLED")} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl">Cancel Task</button>
                )}
              </div>
            )}

            {selectedTask.isRequester && selectedTask.status === "OPEN" && (
              <div className="pt-3 border-t border-slate-100">
                <button onClick={() => confirm("Cancel this task?") && handleTaskStatus(selectedTask.id, "CANCELLED")} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl">Cancel Task</button>
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
                            onClick={() => handleSelectWorker(selectedTask.id, app.id)}
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


      {reportTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[70]">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Report Message</h3>
                <p className="text-[11px] text-slate-500 mt-1">Reports are sent to Synora administrators for review.</p>
              </div>
              <button type="button" onClick={() => setReportTarget(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 break-words">
              {reportTarget.preview || "Message"}
            </div>
            <form onSubmit={handleReportMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportForm.reason}
                  onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white"
                >
                  <option value="HARASSMENT">Harassment</option>
                  <option value="ADULT_CONTENT">Adult / sexual content</option>
                  <option value="THREAT">Threat or intimidation</option>
                  <option value="SPAM">Spam</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Extra details (optional)</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={reportForm.details}
                  onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                  placeholder="Add context that will help an administrator review this report."
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setReportTarget(null)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-rose-700 text-white font-bold rounded-xl">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRatingModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Rate Task Participant</h3>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleRateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Score</label>
                <select value={taskRatingForm.score} onChange={(e) => setTaskRatingForm({ ...taskRatingForm, score: Number(e.target.value) })} className="w-full border border-slate-300 rounded-xl p-2.5">
                  {[5,4,3,2,1].map((score) => <option key={score} value={score}>{score} / 5</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Comment (optional)</label>
                <textarea maxLength={1000} rows={3} value={taskRatingForm.comment} onChange={(e) => setTaskRatingForm({ ...taskRatingForm, comment: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5" placeholder="Keep feedback respectful and task-focused." />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl">Submit Rating</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
