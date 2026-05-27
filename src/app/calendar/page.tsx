'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import HubBackground from '@/components/HubBackground';
import { createClient } from '@/utils/supabase/client';

interface BroadcastEvent {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  estimated_duration_mins: number;
}

export default function BroadcastCalendarPage() {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<BroadcastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchedules() {
      setLoading(true);
      const { data, error } = await supabase
        .from('broadcast_schedule')
        .select('id, title, description, scheduled_start, estimated_duration_mins')
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true });

      if (cancelled) return;

      if (!error && data) {
        setEvents(data as BroadcastEvent[]);
      } else if (error) {
        console.error('[calendar] Failed to load schedules:', error);
      }
      setLoading(false);
    }

    void fetchSchedules();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-35">
        <HubBackground />
      </div>
      <main className="relative z-10 mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-6">
        <Link
          href="/streamers"
          className="mb-4 inline-flex items-center gap-2 text-xs text-white/45 transition-colors hover:text-[#00f2ff]"
        >
          <ArrowLeft size={14} />
          Streamers hub
        </Link>

        <div className="flex items-center gap-2 text-[#00f2ff]">
          <CalendarDays size={22} />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Upcoming Shared Broadcast Schedules
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Plan your viewing times and connect with live creators across generations.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm italic text-white/45">Syncing event rosters…</p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/45 p-8 text-center text-sm text-white/45">
            No live broadcast gatherings are mapped out on the immediate event horizon yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col rounded-xl border border-white/10 bg-black/45 p-5 shadow-lg transition-all hover:border-white/20 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#00f2ff]">
                    {new Date(event.scheduled_start).toLocaleString([], {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-white">{event.title}</h3>
                  {event.description ? (
                    <p className="mt-1 text-sm text-white/55">{event.description}</p>
                  ) : null}
                </div>
                <div className="mt-4 shrink-0 md:mt-0 md:text-right">
                  <span className="rounded-full border border-white/10 bg-[#050508] px-3 py-1.5 font-mono text-xs text-white/55">
                    ⏱️ {event.estimated_duration_mins} minutes
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
