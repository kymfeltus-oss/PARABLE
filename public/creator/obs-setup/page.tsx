export default function ObsSetupPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Stream Setup (OBS)</h1>

      <p className="text-gray-300 mb-3">RTMP Server URL:</p>
      <p className="bg-[#111] border border-white/10 p-2 rounded mb-6">
        rtmp://live.cloudflare.com:1935/live/
      </p>

      <p className="text-gray-300 mb-3">Your Stream Key:</p>
      <p className="bg-[#111] border border-white/10 p-2 rounded mb-6">
        Visit /creator/stream-key to generate key
      </p>

      <p className="text-sm text-gray-400">
        Enter the RTMP server and your stream key into OBS → Settings →
        Stream → Custom Server to go live on Parable.
      </p>
    </div>
  );
}
