"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Loader2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import Image from "next/image";
import HubBackground from "@/components/HubBackground";

const CALLINGS = [
  "Pastor/Preacher",
  "Musician",
  "Artist",
  "Podcaster",
  "Influencer",
  "Gamer",
  "Streamer",
  "Member",
];

const InputField = ({
  name,
  placeholder,
  type = "text",
  value,
  onChange,
}: any) => (
  <motion.div whileTap={{ scale: 0.98 }} className="w-full">
    <input
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-black/60 border border-white/10 p-5 text-[10px] font-black uppercase tracking-[3px] text-white outline-none focus:border-[#00f2ff] placeholder:text-gray-600 rounded-3xl transition-all focus:bg-white/5 shadow-2xl"
    />
  </motion.div>
);

export default function CreateAccount() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const completeOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.length === 0) {
      setErrorMsg("SELECT AT LEAST ONE CALLING");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const finalFileName = "KymFeltus.jpg";

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username.toLowerCase(),
            avatar_url: finalFileName,
          },

          // ✅ CRITICAL FIX — CALLBACK FIRST, THEN SANCTUARY
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/my-sanctuary`,
        },
      });

    if (authError) {
      setErrorMsg(authError.message.toUpperCase());
      setLoading(false);
      return;
    }

    if (authData.user) {
      setSuccessMsg(
        "VERIFICATION PENDING. PLEASE CHECK YOUR ZOHO INBOX."
      );

      if (imageFile) {
        await supabase.storage
          .from("avatars")
          .upload(finalFileName, imageFile, { upsert: true });
      }

      const createProfile = async (attempt = 1): Promise<any> => {
        const { error } = await supabase.from("profiles").upsert({
          id: authData.user!.id,
          username: formData.username.toLowerCase(),
          full_name: formData.full_name,
          role: selectedRoles.join(", "),
          avatar_url: finalFileName,
          onboarding_complete: true,
        });

        if (error && attempt < 3) {
          await new Promise((r) => setTimeout(r, 1500));
          return createProfile(attempt + 1);
        }

        return error;
      };

      await createProfile();
    }

    setLoading(false);
  };

  return (
    <div className="w-full bg-[#050505] text-white relative flex flex-col items-center">
      <HubBackground />

      <div className="relative z-20 w-full min-h-screen pt-16 pb-96 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-black/40 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[4rem] shadow-2xl mb-20"
        >
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative w-48 h-16 mb-4">
              <Image
                src="/logo.svg"
                alt="Parable Protocol"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-[8px] text-[#00f2ff]">
              IDENTITY_SYNC
            </h1>
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-[5px]">
              Initialize sanctuary protocol
            </p>
          </div>

          <form onSubmit={completeOnboarding} className="space-y-8">
            <div className="flex flex-col items-center">
              <label className="relative cursor-pointer">
                <div className="w-32 h-32 rounded-[2.5rem] border-2 border-dashed border-[#00f2ff]/30 flex items-center justify-center overflow-hidden bg-black">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-[#00f2ff]/40 w-10 h-10" />
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#00f2ff] p-2.5 rounded-full text-black">
                  <Plus size={16} strokeWidth={4} />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="full_name"
                placeholder="FULL NAME / MINISTRY"
                value={formData.full_name}
                onChange={(e: any) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              <InputField
                name="username"
                placeholder="UNIQUE USERNAME"
                value={formData.username}
                onChange={(e: any) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="email"
                type="email"
                placeholder="EMAIL ADDRESS"
                value={formData.email}
                onChange={(e: any) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <InputField
                name="password"
                type="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={(e: any) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">
                  {errorMsg}
                </motion.p>
              )}
              {successMsg && (
                <motion.p className="text-[#00f2ff] text-[9px] font-black uppercase tracking-widest text-center">
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-[6px] rounded-3xl flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  SYNCING_SOUL...
                </>
              ) : (
                <>
                  INITIALIZE_ACCOUNT <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-3">
            <ShieldCheck size={14} className="text-[#00f2ff]" />
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[2px]">
              Encrypted by Sanctuary Protocol
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
