import { ShieldCheck, Flame, Star, Coffee } from 'lucide-react';

const ProfileWidgets = ({ profile }: any) => {
  return (
    <div className="flex flex-col gap-4 w-full md:w-80">
      
      {/* 1. User Info Card (Discord Style) */}
      <div className="bg-[#18191c] rounded-lg p-4 shadow-xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">About Me</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          {profile?.status_text || "No status set yet..."}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Member Since</h3>
          <p className="text-sm text-white">April 20, 2026</p>
        </div>
      </div>

      {/* 2. Badges/Achievements (Twitch/Discord Hybrid) */}
      <div className="bg-[#18191c] rounded-lg p-4 border border-gray-800">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge icon={<ShieldCheck className="w-4 h-4 text-blue-400" />} label="Founder" />
          <Badge icon={<Flame className="w-4 h-4 text-orange-500" />} label="Top Streamer" />
          <Badge icon={<Star className="w-4 h-4 text-yellow-400" />} label="MVP" />
          <Badge icon={<Coffee className="w-4 h-4 text-brown-400" />} label="Supporter" />
        </div>
      </div>

      {/* 3. Connected Groups (Facebook Style) */}
      <div className="bg-[#18191c] rounded-lg p-4 border border-gray-800">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Study Groups</h3>
        <ul className="space-y-3">
          <GroupItem name="The Sanctuary" members="1.2k" />
          <GroupItem name="Dev Pulse" members="842" />
        </ul>
      </div>

    </div>
  );
};

const Badge = ({ icon, label }: any) => (
  <div className="flex items-center gap-1 bg-[#2f3136] px-2 py-1 rounded text-[10px] font-bold text-white uppercase group relative">
    {icon}
    <span className="hidden group-hover:block absolute -top-8 left-0 bg-black p-1 rounded text-white">{label}</span>
  </div>
);

const GroupItem = ({ name, members }: any) => (
  <li className="flex items-center justify-between hover:bg-[#2f3136] p-2 rounded cursor-pointer transition">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold">{name[0]}</div>
      <span className="text-sm font-medium text-white">{name}</span>
    </div>
    <span className="text-[10px] text-gray-400">{members}</span>
  </li>
);

export default ProfileWidgets;
