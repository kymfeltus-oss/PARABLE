"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  User as UserIcon,
  Heart,
  MessageSquare,
  Loader2,
  X,
  Search,
  Zap,
  Bell,
  Send,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import HubBackground from "@/components/HubBackground";
import Header from "@/components/Header";

const FILTERS = [
  { name: "None", class: "none" },
  { name: "Vintage", class: "sepia(0.5) contrast(1.1)" },
  { name: "Vivid", class: "saturate(1.5) brightness(1.1)" },
  { name: "Dramatic", class: "grayscale(1) contrast(1.2)" },
];

const KYM_LOCAL_ASSETS = [
  { id: "k1", url: "/creator/Kym%20Pics/IMG_4836.jpeg", likes_count: 2400, comments_count: 156, comments: [] },
  { id: "k2", url: "/creator/Kym%20Pics/IMG_4837.jpeg", likes_count: 1100, comments_count: 84, comments: [] },
  { id: "k3", url: "/creator/Kym%20Pics/IMG_4839.jpeg", likes_count: 3800, comments_count: 210, comments: [] },
  { id: "k4", url: "/creator/Kym%20Pics/IMG_4840.jpeg", likes_count: 942, comments_count: 33, comments: [] },
  { id: "k5", url: "/creator/Kym%20Pics/IMG_4841.jpeg", likes_count: 1500, comments_count: 67, comments: [] },
  { id: "k6", url: "/creator/Kym%20Pics/IMG_4842.jpeg", likes_count: 2900, comments_count: 112, comments: [] },
  { id: "k7", url: "/creator/Kym%20Pics/IMG_4843.jpeg", likes_count: 4200, comments_count: 301, comments: [] },
];

const sanctuaryStyles = `
  @keyframes gridDrift {
    0% { transform: translateY(0); opacity: .16; }
    100% { transform: translateY(22px); opacity: .16; }
  }
  @keyframes floatUp { 
    0% { transform: translateY(0) scale(0); opacity: 0; } 
    50% { opacity: .9; transform: translateY(-110px) scale(1.2); } 
    100% { transform: translateY(-220px) scale(0); opacity: 0; } 
  }
  @keyframes techScan {
    0% { transform: translateY(-140%); opacity: 0; }
    15% { opacity: .9; }
    55% { opacity: .25; }
    100% { transform: translateY(180%); opacity: 0; }
  }
  @keyframes borderPulse {
    0%,100% { box-shadow: 0 0 0 rgba(0,242,255,0); }
    50% { box-shadow: 0 0 44px rgba(0,242,255,.12); }
  }
  @keyframes dotPulse {
    0% { opacity: .18; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-1px); }
    100% { opacity: .18; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-120%); opacity: 0; }
    15% { opacity: .9; }
    55% { opacity: .25; }
    100% { transform: translateX(140%); opacity: 0; }
  }
`;

function LiveStatusStrip() {
  const [phase, setPhase] = useState(0);
  const phases = useMemo(
    () => ["SYNCING", "SCANNING", "READY", "READY"],
    []
  );

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % phases.length), 900);
    return () => clearInterval(t);
  }, [phases.length]);

  return (
    <div className="mt-4 rounded-sm border border-[#00f2ff]/18 bg-black/45 px-4 py-3 overflow-hidden relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 md:opacity-100"
        style={{ animation: "techScan 3.2s linear infinite" }}
      >
        <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]" />
          <span className="text-[10px] font-black uppercase tracking-[6px] text-white/45">
            STATUS
          </span>
          <span className="text-[10px] font-black uppercase tracking-[6px] text-[#00f2ff] drop-shadow-[0_0_10px_#00f2ff]">
            {phases[phase]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className="h-1.5 w-1.5 rounded-full bg-[#00f2ff]"
              style={{
                animation: "dotPulse 1s ease-in-out infinite",
                animationDelay: `${n * 0.18}s`,
                opacity: 0.25,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-3 h-[2px] bg-white/10 overflow-hidden">
        <div className="absolute left-0 w-1 h-full bg-[#00f2ff]" />
        <div className="absolute right-0 w-1 h-full bg-[#00f2ff]" />
        <div
          className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-60"
          style={{ animation: "shimmer 1.8s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}

export default function MySanctuary() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [trending, setTrending] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  // SPA IDENTITY SYNC STATE
  const [refreshHeader, setRefreshHeader] = useState(0);

  // MESSAGING STATES
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([
    { id: "1", name: "Alpha Creator", lastMessage: "The vision is clear.", status: "online" },
    { id: "2", name: "Beta Artist", lastMessage: "New manifestation uploaded.", status: "offline" },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("none");

  useEffect(() => {
    document.body.style.overflow = selectedPost || isModalOpen || isMessengerOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPost, isModalOpen, isMessengerOpen]);

  const fetchEverything = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (prof) {
      if (prof.avatar_url && !prof.avatar_url.startsWith("http")) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(prof.avatar_url);
        prof.avatar_url = urlData.publicUrl;
      }
      setProfile(prof);
      setEditFullName(prof.full_name || "");
      setEditBio(prof.bio || "");

      const [follRes, fingRes, trendRes] = await Promise.all([
        supabase.from("followers").select("*", { count: "exact", head: true }).eq("following_id", prof.id),
        supabase.from("followers").select("*", { count: "exact", head: true }).eq("follower_id", prof.id),
        supabase.from("trending_creators").select("*").limit(5),
      ]);
      setFollowerCount(follRes.count ?? 0);
      setFollowingCount(fingRes.count ?? 0);
      if (trendRes.data) setTrending(trendRes.data);
    }

    const { data: posts } = await supabase
      .from("posts")
      .select("*, likes(count), comments(id, content, created_at, profiles(full_name, avatar_url))")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (posts) {
      setDbPosts(
        posts.map((p: any) => ({
          ...p,
          likes_count: p.likes?.[0]?.count ?? 0,
          comments_count: p.comments?.length ?? 0,
        }))
      );
    }
  }, [supabase]);

  useEffect(() => {
    fetchEverything();
  }, [fetchEverything]);

  // SPA IDENTITY UPDATE LOGIC
  const handleSaveChanges = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editFullName, bio: editBio })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, full_name: editFullName, bio: editBio });
      setIsEditing(false);
      setRefreshHeader((prev) => prev + 1); // Triggers Header refetch instantly
    }
  };

  const handleNavigate = (userId: string) => {
    if (userId === profile?.id) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
    router.push(`/profile/${userId}`);
  };

  const handleSearchSubmit = () => {
    const userToNavigateTo = searchResults.find(
      (user) => user.full_name.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (userToNavigateTo) handleNavigate(userToNavigateTo.id);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 1) return setSearchResults([]);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, bio, role")
      .ilike("full_name", `%${query}%`)
      .limit(5);
    if (data) setSearchResults(data);
  };

  const handlePostComment = async (postId: string) => {
    if (!commentText.trim() || !profile) return;
    await supabase.from("comments").insert([{ post_id: postId, user_id: profile.id, content: commentText }]);
    setCommentText("");
    fetchEverything();
  };

  const handleFileSelection = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
  };

  const handleFinalPost = async () => {
    if (!selectedFile || !profile) return;
    setUploading("post");
    const fileName = `${profile.id}-${Date.now()}.jpg`;
    await supabase.storage.from("posts").upload(fileName, selectedFile);
    const {
      data: { publicUrl },
    } = supabase.storage.from("posts").getPublicUrl(fileName);
    await supabase
      .from("posts")
      .insert([{ profile_id: profile.id, media_url: publicUrl, caption, filter_setting: selectedFilter, post_type: "image" }]);
    setIsModalOpen(false);
    setCaption("");
    setSelectedFilter("none");
    setUploading(null);
    fetchEverything();
  };

  // ✅ LIVE FEED: new users start with no posts (no seeded assets)
  const sanctuaryVault = useMemo(() => [...dbPosts], [dbPosts]);

  const activeDisplayResults = searchQuery.trim().length >= 2 ? searchResults : trending;

  // ✅ ONLY FIX: allow Header to accept refreshTrigger without TS failing
  const HeaderWithProps: any = Header;

  return (
    <div className="w-full bg-black text-white relative min-h-screen selection:bg-[#00f2ff]">
      <style>{sanctuaryStyles}</style>

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,242,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,255,0.055)_1px,transparent_1px)] bg-[size:56px_56px]"
            style={{ animation: "gridDrift 6s ease-in-out infinite alternate" }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[32vh] bg-gradient-to-t from-[#00f2ff]/6 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,black_100%)] opacity-90" />
      </div>

      {/* HEADER SYNC PROP */}
      <HeaderWithProps refreshTrigger={refreshHeader} />

      {/* ✅ PHONE APP WIDTH (official app feel) */}
      <main className="relative z-10 pt-28 px-4 pb-40 mx-auto w-full max-w-[430px]">
        {/* SEARCH HUD */}
        <div
          className="relative mb-7 overflow-visible rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md"
          style={{ animation: "borderPulse 5s ease-in-out infinite" }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
            <div
              className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
              style={{ animation: "techScan 3.2s linear infinite" }}
            />
          </div>

          <div className="relative flex items-center px-4 py-4">
            <Search size={18} className="text-white/30 mr-3" />
            <input
              id="creator-search-input"
              name="creator-search-input"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="Search creators..."
              className="bg-transparent w-full text-sm outline-none font-bold placeholder:text-white/25"
            />
          </div>

          <AnimatePresence>
            {searchQuery.trim().length > 0 && activeDisplayResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-3 bg-zinc-900/95 border border-white/10 rounded-2xl overflow-hidden z-[60] shadow-2xl backdrop-blur-xl"
              >
                {searchQuery.trim().length < 2 && (
                  <div className="p-3 border-b border-white/5 text-[8px] font-black uppercase tracking-[3px] text-[#00f2ff] flex items-center gap-2 px-4">
                    <Zap size={10} fill="#00f2ff" /> Trending
                  </div>
                )}
                {activeDisplayResults.map((user) => (
                  <button
                    key={user.id}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left"
                    onClick={() => handleNavigate(user.id)}
                  >
                    <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-[#00f2ff]/20" />
                    <div>
                      <p className="text-xs font-black uppercase text-white flex items-center gap-2">
                        {user.id === profile?.id ? profile.full_name || "CEO" : user.full_name}
                        <span className="text-[8px] text-[#00f2ff] font-bold flex items-center gap-0.5">
                          {user.role || "CREATOR"} <Zap size={8} fill="#00f2ff" />
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-500 line-clamp-1 italic">{user.bio || "No bio yet"}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PROFILE HUD CARD */}
        <section
          className="relative overflow-hidden rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md p-5"
          style={{ animation: "borderPulse 5s ease-in-out infinite" }}
        >
          {/* scan */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
              style={{ animation: "techScan 3.6s linear infinite" }}
            />
          </div>

          {/* halo glow */}
          <div className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2">
            <div className="h-[240px] w-[240px] rounded-full bg-[#00f2ff]/10 blur-[90px]" />
            <div className="absolute inset-0 left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00f2ff]/5 blur-[140px]" />
          </div>

          <div className="relative">
            {/* avatar + stats */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-[#00f2ff]/30 bg-black shadow-[0_0_25px_#00f2ff33] overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover object-center" alt="CEO Identity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <UserIcon size={30} className="text-white/20" />
                    </div>
                  )}
                </div>

                <label className="absolute bottom-0 right-0 bg-[#00f2ff] p-1.5 rounded-full text-black border-4 border-black cursor-pointer z-10 hover:scale-110 transition-transform">
                  <Camera size={14} strokeWidth={4} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelection(e)} />
                </label>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-2 text-center font-black italic uppercase tracking-tighter text-white">
                <div className="rounded-sm border border-white/10 bg-white/5 py-3">
                  <p className="text-xl leading-none">{sanctuaryVault.length}</p>
                  <p className="text-[8px] text-white/35 tracking-[3px] mt-1">Posts</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-white/5 py-3">
                  <p className="text-xl leading-none">{followerCount.toLocaleString()}</p>
                  <p className="text-[8px] text-white/35 tracking-[3px] mt-1">Followers</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-white/5 py-3">
                  <p className="text-xl leading-none">{followingCount.toLocaleString()}</p>
                  <p className="text-[8px] text-white/35 tracking-[3px] mt-1">Following</p>
                </div>
              </div>
            </div>

            {/* name / role / bio */}
            <div className="mt-6 space-y-1">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-white/10 p-3 rounded-lg text-white text-2xl font-black italic uppercase tracking-tighter outline-none border border-[#00f2ff]/30"
                  />
                ) : (
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    {profile?.full_name || "CEO"}
                  </h2>
                )}
                <Bell size={18} className="text-white/20" />
              </div>

              <p className="text-[10px] text-[#00f2ff] font-black uppercase tracking-[4px]">
                {profile?.role || "CREATOR"}
              </p>

              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-white/10 p-3 mt-2 rounded-lg text-gray-300 font-bold outline-none border border-[#00f2ff]/30"
                  rows={3}
                />
              ) : (
                <p className="text-gray-400 font-bold italic text-[11px] max-w-sm mt-2">
                  {profile?.bio || "No bio yet"}
                </p>
              )}
            </div>

            {/* alive status */}
            <LiveStatusStrip />

            {/* actions */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsMessengerOpen(true)}
                className="relative group col-span-1 rounded-sm border border-[#00f2ff]/30 bg-black/70 py-3 text-[10px] font-black uppercase tracking-[2px] shadow-[0_0_18px_rgba(0,242,255,0.10)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-[#00f2ff] group-hover:text-white transition-colors">
                  <Send size={12} /> Messages
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-[#00f2ff]/10 blur-[18px]" />
                </div>
              </button>

              {isEditing ? (
                <button
                  onClick={handleSaveChanges}
                  className="relative group col-span-1 rounded-sm border border-[#00f2ff]/30 bg-[#00f2ff] py-3 text-[10px] font-black uppercase tracking-[2px] text-black hover:brightness-110 transition-all"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="relative group col-span-1 rounded-sm border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-[2px] hover:border-[#00f2ff]/25 transition-all"
                >
                  Edit
                </button>
              )}

              <label className="relative group col-span-1 rounded-sm border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-[2px] cursor-pointer flex items-center justify-center gap-2 hover:border-[#00f2ff]/25 transition-all">
                <Plus size={12} strokeWidth={4} /> Post
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelection} />
              </label>
            </div>
          </div>
        </section>

        {/* GRID HUD */}
        <section className="mt-6 overflow-hidden rounded-sm border border-[#00f2ff]/14 bg-black/40">
          {sanctuaryVault.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[6px] text-[#00f2ff]">
                Sanctuary Initialized
              </p>
              <p className="mt-3 text-sm text-white/60 font-bold italic leading-relaxed">
                Your vault is empty. Post your first manifestation to begin building your legacy.
              </p>

              <label className="mt-6 inline-flex items-center justify-center gap-2 rounded-sm border border-[#00f2ff]/30 bg-black/70 px-5 py-3 text-[10px] font-black uppercase tracking-[4px] text-[#00f2ff] cursor-pointer hover:text-white transition-colors">
                <Plus size={14} /> Create First Post
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelection} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px]">
              {sanctuaryVault.map((post, i) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square relative group bg-white/5 overflow-hidden cursor-pointer"
                >
                  <img
                    src={post.media_url || post.url}
                    style={{ filter: post.filter_setting || "none" }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 shadow-inner"
                    alt="Manifestation"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 font-black text-[10px]">
                      <Heart size={14} fill="#00f2ff" /> {post.likes_count ?? 0}
                    </div>
                    <div className="flex items-center gap-1 font-black text-[10px]">
                      <MessageSquare size={14} fill="white" /> {post.comments_count ?? 0}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* MESSAGING SIDEBAR */}
        <AnimatePresence>
          {isMessengerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex justify-end bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-white/10"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center text-[#00f2ff] uppercase font-black tracking-widest text-xs">
                  Kingdom Chat Hub
                  <button
                    onClick={() => setIsMessengerOpen(false)}
                    className="text-white hover:rotate-90 transition-transform cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveChat(conv)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-[#00f2ff]/20">
                          <UserIcon size={20} className="text-white/20" />
                        </div>
                        {conv.status === "online" && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00f2ff] rounded-full border-2 border-zinc-900" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest">{conv.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 italic">{conv.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE CHAT OVERLAY */}
        <AnimatePresence>
          {activeChat && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 right-0 z-[130] w-full max-w-sm h-[500px] bg-black border border-white/10 rounded-t-3xl shadow-2xl flex flex-col mr-4 overflow-hidden"
            >
              <div className="p-4 bg-zinc-900 flex justify-between items-center border-b border-white/10">
                <p className="text-[10px] font-black uppercase text-[#00f2ff]">{activeChat.name}</p>
                <button onClick={() => setActiveChat(null)} className="cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/40">
                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none max-w-[80%] ml-2 border border-white/5">
                  <p className="text-xs italic text-gray-300">{activeChat.lastMessage}</p>
                </div>
              </div>
              <div className="p-4 border-t border-white/10 bg-zinc-900 flex gap-2">
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Speak thoughts..."
                  className="flex-1 bg-black border border-white/5 rounded-full px-4 py-2 text-xs outline-none focus:border-[#00f2ff]/30 font-bold"
                />
                <button className="p-2 bg-[#00f2ff] rounded-full text-black hover:scale-105 transition-transform">
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMMENT MODAL */}
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/95 p-0 md:p-4 backdrop-blur-md"
            >
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.3}
                onDragEnd={(_, info) => info.offset.y > 100 && setSelectedPost(null)}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-zinc-900 w-full max-w-4xl h-[85vh] md:h-[80vh] rounded-t-3xl md:rounded-3xl flex flex-col md:flex-row overflow-hidden border border-white/10 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 left-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3 md:hidden" />
                <div className="flex-1 bg-black flex items-center justify-center relative">
                  <img
                    src={selectedPost.media_url || selectedPost.url}
                    style={{ filter: selectedPost.filter_setting }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full md:w-[380px] flex flex-col bg-zinc-900 border-l border-white/5">
                  <div className="p-4 border-b border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#00f2ff]/30 overflow-hidden bg-white/5">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="p-2 text-white/20" />
                      )}
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[2px]">{profile?.full_name || "CEO"}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {selectedPost.comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-3">
                        <img src={c.profiles?.avatar_url} className="w-7 h-7 rounded-full object-cover shadow-sm" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-[#00f2ff]">{c.profiles?.full_name}</p>
                          <p className="text-xs text-gray-300 font-bold leading-tight">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Speak thoughts..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs outline-none focus:border-[#00f2ff]/30 font-bold"
                    />
                    <button
                      onClick={() => handlePostComment(selectedPost.id)}
                      className="text-[#00f2ff] text-[10px] font-black uppercase px-2 hover:brightness-125 transition-all"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPLOAD MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                  <button onClick={() => setIsModalOpen(false)} className="cursor-pointer hover:text-[#00f2ff]">
                    <X size={20} />
                  </button>
                  <h3 className="text-[10px] font-black uppercase tracking-[4px]">New Manifestation</h3>
                  <div className="w-5" />
                </div>
                <div className="aspect-square bg-black overflow-hidden">
                  <img src={previewUrl || ""} style={{ filter: selectedFilter }} className="w-full h-full object-cover transition-all" />
                </div>
                <div className="flex gap-2 p-4 overflow-x-auto bg-black/50 custom-scrollbar">
                  {FILTERS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setSelectedFilter(f.class)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-bold border transition-all whitespace-nowrap ${
                        selectedFilter === f.class
                          ? "border-[#00f2ff] bg-[#00f2ff] text-black shadow-[0_0_10px_#00f2ff66]"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  <textarea
                    placeholder="Speak vision..."
                    className="w-full bg-transparent outline-none text-sm resize-none text-gray-300 font-bold italic"
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleFinalPost}
                  disabled={uploading === "post"}
                  className="w-full bg-[#00f2ff] text-black font-black py-5 uppercase tracking-[4px] text-[11px] disabled:opacity-50 hover:brightness-110 transition-all"
                >
                  {uploading === "post" ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Manifest Now"}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        html,
        body {
          height: 100%;
          overscroll-behavior-y: none;
          background: black;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 242, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
