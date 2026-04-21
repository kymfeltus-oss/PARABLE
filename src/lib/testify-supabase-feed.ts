import { createClient } from '@/utils/supabase/client';
import type { PortalPost } from '@/components/testify/TestifyLivePortalFeed';

type ProfileJoin = { full_name: string | null; avatar_url: string | null } | null;

type PostRow = {
  id: string;
  profile_id: string;
  content: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  is_praise_break: boolean | null;
  created_at: string;
  profiles?: ProfileJoin | ProfileJoin[];
};

function profileName(row: PostRow): string {
  const p = row.profiles;
  const one = Array.isArray(p) ? p[0] : p;
  const n = one?.full_name?.trim();
  return n || 'Community';
}

function inferMediaType(url: string): 'image' | 'video' | null {
  const u = url.split('?')[0]?.toLowerCase() ?? '';
  if (/\.(jpg|jpeg|png|webp|gif|avif)$/.test(u)) return 'image';
  if (/\.(mp4|webm|mov|m4v)$/.test(u)) return 'video';
  return null;
}

export function mapPostRowToPortalPost(row: PostRow): PortalPost {
  const url = row.media_url?.trim() || undefined;
  const fromDb = row.media_type === 'video' || row.media_type === 'image' ? row.media_type : null;
  const inferred = url && !fromDb ? inferMediaType(url) : null;
  const mediaType = fromDb ?? inferred ?? null;

  const tag = row.is_praise_break ? 'PRAISE BREAK' : 'TESTIMONY';

  return {
    id: row.id,
    user: profileName(row),
    authorId: row.profile_id,
    time: 'COMMUNITY',
    tag,
    text: row.content?.trim() || '',
    mediaUrl: url,
    mediaType,
    createdAt: new Date(row.created_at).getTime(),
    stats: {
      amens: 0,
      comments: 0,
      shares: 0,
      praiseBreaks: row.is_praise_break ? 1 : 0,
      claps: 0,
      dances: 0,
      shouts: 0,
    },
  };
}

/** All recent posts (For You). Requires `posts` + `profiles` in Supabase. */
export async function fetchCommunityTestifyPosts(limit = 50): Promise<PortalPost[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, profile_id, content, media_url, media_type, is_praise_break, created_at, profiles:profile_id(full_name, avatar_url)'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[testify feed]', error.message);
    return [];
  }

  const rows = (data ?? []) as PostRow[];
  return rows.map(mapPostRowToPortalPost);
}
