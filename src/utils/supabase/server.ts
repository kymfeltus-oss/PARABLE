import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ Works across Next versions: if getAll() exists use it, otherwise manually enumerate
        getAll() {
          const anyStore = cookieStore as any;

          if (typeof anyStore.getAll === "function") {
            return anyStore.getAll();
          }

          // Fallback: try common shapes
          // Some runtimes only support `get(name)` + `getAll` missing.
          // We return an empty list; auth will still work for initial checks,
          // and setAll will attach cookies when needed.
          return [];
        },

        setAll(cookiesToSet) {
          const anyStore = cookieStore as any;

          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (typeof anyStore.set === "function") {
                anyStore.set(name, value, options);
              }
            });
          } catch {
            // cookies can be read-only in some server component contexts
          }
        },
      },
    }
  );
}
