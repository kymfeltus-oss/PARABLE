export const CREATE_ROUTES = {
  post: "/create/post",
  story: "/create/story",
  reel: "/create/reel",
  live: "/create/live",
} as const;

export type CreateFlowKind = keyof typeof CREATE_ROUTES;

export function createFlowHref(kind: CreateFlowKind, params?: Record<string, string>): string {
  const base = CREATE_ROUTES[kind];
  if (!params || Object.keys(params).length === 0) return base;
  const qs = new URLSearchParams(params).toString();
  return `${base}?${qs}`;
}
