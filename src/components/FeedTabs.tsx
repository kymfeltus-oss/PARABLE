'use client';

interface FeedTabsProps {
  activeTab: 'all' | 'following' | 'trending';
  onTabChange: (tab: 'all' | 'following' | 'trending') => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
  ] as const;

  return (
    <div className="flex gap-6 border-b border-gray-800 pb-4 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-sm font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${
            activeTab === tab.id
              ? 'text-[#00f2ff] border-[#00f2ff]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}