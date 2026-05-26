'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Church,
  Facebook,
  Gamepad2,
  Heart,
  Instagram,
  Link as LinkIcon,
  Mic,
  Music,
  Palette,
  Pencil,
  Sparkles,
  X,
  Check,
  Youtube,
} from 'lucide-react';
import { parseCreatorCategories } from '@/lib/sanctuary-creator-state';
import {
  defaultQuickInfo,
  loadQuickInfo,
  quickInfoToProfileBio,
  saveQuickInfoLocal,
  type SanctuaryQuickInfo,
} from '@/lib/sanctuary-bio-storage';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

function badgeFor(label: string) {
  const l = label.toLowerCase();
  if (l.includes('pastor') || l.includes('preacher'))
    return { icon: <Church className="h-3.5 w-3.5" />, tint: 'border-amber-400/35 text-amber-100/90 bg-amber-500/10' };
  if (l.includes('musician'))
    return { icon: <Music className="h-3.5 w-3.5" />, tint: 'border-cyan-400/35 text-cyan-100/90 bg-cyan-500/10' };
  if (l.includes('artist'))
    return { icon: <Palette className="h-3.5 w-3.5" />, tint: 'border-fuchsia-400/35 text-fuchsia-100/90 bg-fuchsia-500/10' };
  if (l.includes('podcaster'))
    return { icon: <Mic className="h-3.5 w-3.5" />, tint: 'border-orange-400/35 text-orange-100/90 bg-orange-500/10' };
  if (l.includes('influencer'))
    return { icon: <Sparkles className="h-3.5 w-3.5" />, tint: 'border-violet-400/35 text-violet-100/90 bg-violet-500/10' };
  if (l.includes('gamer') || l.includes('streamer'))
    return { icon: <Gamepad2 className="h-3.5 w-3.5" />, tint: 'border-sky-400/35 text-sky-100/90 bg-sky-500/10' };
  return { icon: <Heart className="h-3.5 w-3.5" />, tint: 'border-emerald-400/35 text-emerald-100/90 bg-emerald-500/10' };
}

const inputClass =
  'w-full rounded-xl border border-white/12 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 shadow-inner focus:border-[#00f2ff]/40 focus:outline-none focus:ring-1 focus:ring-[#00f2ff]/25';

type Props = {
  role: string | null | undefined;
  bioText: string | null | undefined;
  fullName?: string | null;
};

function normalizeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  return `https://${t}`;
}

export default function SanctuaryBioModule({ role, bioText, fullName }: Props) {
  const { userProfile, refreshProfile } = useAuth();
  const userId = userProfile?.id as string | undefined;

  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<SanctuaryQuickInfo>(() =>
    defaultQuickInfo(fullName, bioText),
  );
  const [saving, setSaving] = useState(false);
  const [saveHint, setSaveHint] = useState<string | null>(null);

  const hydrate = useCallback(() => {
    if (!userId) return;
    setFields(loadQuickInfo(userId, fullName, bioText));
  }, [userId, fullName, bioText]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const categories = parseCreatorCategories(role);

  const update = <K extends keyof SanctuaryQuickInfo>(key: K, value: SanctuaryQuickInfo[K]) => {
    setFields((prev) => {
      if (key === 'mantra' && typeof value === 'string') {
        return { ...prev, mantra: value.slice(0, 160) };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSaveHint(null);
    saveQuickInfoLocal(userId, fields);

    const supabase = createClient();
    const payload: Record<string, string> = {
      full_name: fields.ministryBrand.trim(),
      updated_at: new Date().toISOString(),
    };
    const combinedBio = quickInfoToProfileBio(fields);
    payload.bio = combinedBio;

    const { error } = await supabase.from('profiles').update(payload).eq('id', userId);

    if (error) {
      setSaveHint(
        error.message.includes('bio') || error.code === 'PGRST204'
          ? 'Saved on this device. Add a `bio` column to profiles in Supabase to sync mantra/mission.'
          : `Saved locally. Cloud sync: ${error.message}`,
      );
    } else {
      setSaveHint('Synced to your profile.');
      refreshProfile();
    }

    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    hydrate();
    setEditing(false);
    setSaveHint(null);
  };

  const mantraLen = fields.mantra.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_0_50px_rgba(0,242,255,0.06)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#00f2ff]/55">Bio & calling</p>
          <h2 className="mt-2 text-lg font-black text-white">Quick info</h2>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#00f2ff] transition hover:border-[#00f2ff]/50 hover:bg-[#00f2ff]/15"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/70 hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !userId}
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-1 rounded-full border border-[#00f2ff]/40 bg-[#00f2ff] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-black disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {saveHint && !editing && (
        <p className="mt-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/55">{saveHint}</p>
      )}

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex flex-col gap-1.5 border-b border-white/[0.06] pb-3">
          <dt className="text-[10px] font-black uppercase tracking-widest text-white/35">Location</dt>
          <dd className="min-w-0">
            {editing ? (
              <input
                type="text"
                value={fields.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass}
                placeholder="City, region, or digital"
                autoComplete="off"
              />
            ) : (
              <span className="text-white/75">{fields.location}</span>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1.5 border-b border-white/[0.06] pb-3">
          <dt className="text-[10px] font-black uppercase tracking-widest text-white/35">Ministry / brand</dt>
          <dd className="min-w-0">
            {editing ? (
              <input
                type="text"
                value={fields.ministryBrand}
                onChange={(e) => update('ministryBrand', e.target.value)}
                className={inputClass}
                placeholder="Public name or ministry brand"
                autoComplete="organization"
              />
            ) : (
              <span className="break-words text-white/85">{fields.ministryBrand}</span>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <dt className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-white/35">
            <span>Mantra</span>
            {editing && (
              <span className={mantraLen >= 160 ? 'text-amber-400/90' : 'text-white/30'}>
                {mantraLen}/160
              </span>
            )}
          </dt>
          <dd className="min-w-0">
            {editing ? (
              <textarea
                value={fields.mantra}
                onChange={(e) => update('mantra', e.target.value.slice(0, 160))}
                rows={3}
                className={`${inputClass} min-h-[4.5rem] resize-y`}
                placeholder="Short line the community remembers you by"
              />
            ) : (
              <span className="break-words leading-relaxed text-white/70">{fields.mantra}</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/35">The mission</p>
        {editing ? (
          <textarea
            value={fields.mission}
            onChange={(e) => update('mission', e.target.value)}
            rows={5}
            className={`${inputClass} mt-2 min-h-[6rem] resize-y`}
            placeholder="Longer story: calling, focus, what you’re building"
          />
        ) : (
          <p className="mt-2 break-words text-sm leading-relaxed text-white/60">{fields.mission}</p>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Unlocked callings</p>
        <p className="mt-1 text-[10px] text-white/30">From your account role. Update on create-account flow or profile settings.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const b = badgeFor(cat);
            return (
              <span
                key={cat}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider',
                  b.tint,
                ].join(' ')}
              >
                {b.icon}
                {cat}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Social</p>
        {editing ? (
          <div className="mt-3 grid grid-cols-1 gap-3">
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/40">Instagram URL</span>
              <input
                type="url"
                value={fields.socialInstagram}
                onChange={(e) => update('socialInstagram', e.target.value)}
                className={inputClass}
                placeholder="https://instagram.com/…"
                inputMode="url"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/40">Facebook URL</span>
              <input
                type="url"
                value={fields.socialFacebook}
                onChange={(e) => update('socialFacebook', e.target.value)}
                className={inputClass}
                placeholder="https://…"
                inputMode="url"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/40">YouTube URL</span>
              <input
                type="url"
                value={fields.socialYoutube}
                onChange={(e) => update('socialYoutube', e.target.value)}
                className={inputClass}
                placeholder="https://youtube.com/…"
                inputMode="url"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/40">Link hub / website</span>
              <input
                type="url"
                value={fields.socialWebsite}
                onChange={(e) => update('socialWebsite', e.target.value)}
                className={inputClass}
                placeholder="https://…"
                inputMode="url"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  { key: 'socialInstagram' as const, icon: <Instagram className="h-4 w-4" />, label: 'Instagram' },
                  { key: 'socialFacebook' as const, icon: <Facebook className="h-4 w-4" />, label: 'Facebook' },
                  { key: 'socialYoutube' as const, icon: <Youtube className="h-4 w-4" />, label: 'YouTube' },
                  { key: 'socialWebsite' as const, icon: <LinkIcon className="h-4 w-4" />, label: 'Website' },
                ] as const
              ).map((s) => {
                const href = normalizeUrl(fields[s.key]);
                const inner = (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#00f2ff]/20 bg-black/50 text-[#00f2ff]/80 shadow-[0_0_18px_rgba(0,242,255,0.12)] transition hover:border-[#00f2ff]/45 hover:text-[#00f2ff]">
                    {s.icon}
                  </span>
                );
                return href ? (
                  <a
                    key={s.key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                    aria-label={s.label}
                  >
                    {inner}
                  </a>
                ) : (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex opacity-45 hover:opacity-80"
                    aria-label={`Add ${s.label}`}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-white/30">Tap a dim icon to edit and add your link.</p>
          </>
        )}
      </div>
    </motion.section>
  );
}
