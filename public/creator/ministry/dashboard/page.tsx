export default function MinistryDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Ministry Dashboard
        </h2>
        <p className="text-zinc-400">
          Overview of your ministry activity and engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm uppercase text-zinc-400 mb-2">
            Followers
          </h3>
          <p className="text-3xl font-semibold">0</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm uppercase text-zinc-400 mb-2">
            Messages
          </h3>
          <p className="text-3xl font-semibold">0</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm uppercase text-zinc-400 mb-2">
            Live Sessions
          </h3>
          <p className="text-3xl font-semibold">0</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          Quick Actions
        </h3>

        <div className="flex flex-wrap gap-4">
          <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded">
            Go Live
          </button>

          <button className="border border-zinc-600 px-4 py-2 rounded">
            Upload Message
          </button>

          <button className="border border-zinc-600 px-4 py-2 rounded">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
