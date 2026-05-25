export type PostStudioMeta = {
  allowComments: boolean;
  hideLikes: boolean;
  filterId: string;
  location?: string;
  creationType: "post" | "reel";
};

const META_PREFIX = "[[PARABLE_META:";
const META_SUFFIX = "]]";

export function buildPostContent(caption: string, meta: PostStudioMeta): string | null {
  const parts: string[] = [];
  const trimmedCaption = caption.trim();
  if (trimmedCaption) parts.push(trimmedCaption);
  if (meta.location?.trim()) parts.push(`📍 ${meta.location.trim()}`);
  parts.push(`${META_PREFIX}${JSON.stringify(meta)}${META_SUFFIX}`);
  return parts.join("\n\n") || null;
}

export function parsePostContent(raw: string | null | undefined): {
  display: string;
  meta: PostStudioMeta | null;
} {
  if (!raw?.trim()) return { display: "", meta: null };
  const start = raw.lastIndexOf(META_PREFIX);
  if (start === -1) return { display: raw.trim(), meta: null };
  const end = raw.indexOf(META_SUFFIX, start);
  if (end === -1) return { display: raw.trim(), meta: null };
  const json = raw.slice(start + META_PREFIX.length, end);
  let meta: PostStudioMeta | null = null;
  try {
    meta = JSON.parse(json) as PostStudioMeta;
  } catch {
    meta = null;
  }
  const display = raw.slice(0, start).trim();
  return { display, meta };
}

export function commentsAllowedForPost(content: string | null | undefined): boolean {
  const { meta } = parsePostContent(content);
  return meta?.allowComments !== false;
}

/** When hideLikes is set, only the post owner should see counts (Instagram-style). */
export function likesVisibleForViewer(
  content: string | null | undefined,
  isPostOwner: boolean,
): boolean {
  const { meta } = parsePostContent(content);
  if (meta?.hideLikes && !isPostOwner) return false;
  return true;
}
