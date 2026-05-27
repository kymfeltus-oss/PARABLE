"use client";



import type { ReactNode } from "react";

import { fallbackAvatarOnError } from "@/lib/avatar-display";

import type { KickChannelRow } from "@/lib/streamers-types";

import StreamersChannelSkeleton from "@/components/streamers/StreamersChannelSkeleton";



export type { KickChannelRow };



type Props = {

  isGamerView: boolean;

  channels: KickChannelRow[];

  isLoading?: boolean;

  activeChannelId?: string | null;

  onSelectChannel: (id: string) => void;

  leftPanel: ReactNode;

  theater: ReactNode;

  profileBar: ReactNode;

  feed: ReactNode;

  chatPanel: ReactNode;

};



/**

 * Kick.com structural shell: w-64 left · flex-1 center theatre · w-80 right chat.

 * Colors and branding are supplied by parent slots — layout only.

 */

export default function StreamersHubKickLayout({

  isGamerView,

  channels,

  isLoading = false,

  activeChannelId,

  onSelectChannel,

  leftPanel,

  theater,

  profileBar,

  feed,

  chatPanel,

}: Props) {

  const leftShell = isGamerView

    ? "border-[#242F37] bg-[#191F24]"

    : "border-white/[0.08] bg-black/40";

  const centerShell = isGamerView ? "bg-[#0B0E11]" : "bg-transparent";

  const rightShell = isGamerView

    ? "border-[#242F37] bg-[#191F24]"

    : "border-white/[0.08] bg-black/40";



  return (

    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">

      {/* LEFT — recommended channels (hidden on mobile) */}

      <aside

        className={`hidden w-64 shrink-0 flex-col overflow-hidden border-r md:flex ${leftShell}`}

      >

        <p className="shrink-0 px-4 pb-2 pt-4 text-[11px] font-extrabold uppercase tracking-widest text-[#94A3B8]">

          Recommended Channels

        </p>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">

          {isLoading ? (

            <StreamersChannelSkeleton isGamerView={isGamerView} />

          ) : (

            <div className="space-y-1">

              {channels.map((ch) => {

                const active = activeChannelId === ch.id;

                return (

                  <button

                    key={ch.id}

                    type="button"

                    onClick={() => onSelectChannel(ch.id)}

                    className={`flex w-full flex-row items-center gap-3 rounded-lg p-2 text-left transition-colors ${

                      active

                        ? isGamerView

                          ? "border border-emerald-500/50 bg-emerald-500/10"

                          : "border border-[#00f2ff]/35 bg-[#00f2ff]/10"

                        : isGamerView

                          ? "border border-transparent hover:bg-[#242F37]"

                          : "border border-transparent hover:bg-white/[0.05]"

                    }`}

                  >

                    <div className="relative h-10 w-10 shrink-0">

                      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-xs font-bold text-white/50">

                        {ch.profilePicture ? (

                          // eslint-disable-next-line @next/next/no-img-element

                          <img

                            src={ch.profilePicture}

                            alt=""

                            className="h-full w-full object-cover"

                            onError={fallbackAvatarOnError}

                          />

                        ) : (

                          ch.creator.slice(0, 2).toUpperCase()

                        )}

                      </div>

                      {ch.isLive ? (

                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-red-500" />

                      ) : null}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-white">{ch.creator}</p>

                      <p className="truncate text-[11px] text-white/45">{ch.tag}</p>

                    </div>

                    <span className="shrink-0 text-[10px] font-mono tabular-nums text-white/40">

                      {ch.viewers}

                    </span>

                  </button>

                );

              })}

            </div>

          )}

          <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">{leftPanel}</div>

        </div>

      </aside>



      {/* CENTER — 16:9 theatre + profile bar + scrollable feed */}

      <section className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${centerShell}`}>

        <div className="w-full shrink-0 aspect-video bg-black">{theater}</div>

        <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">{profileBar}</div>

        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">

          <div className="space-y-8 p-4 sm:p-6">{feed}</div>

        </div>

      </section>



      {/* RIGHT — chat grid (hidden below lg) */}

      <aside

        className={`hidden h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-l lg:flex ${rightShell}`}

      >

        <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] p-0">{chatPanel}</div>

      </aside>

    </div>

  );

}

