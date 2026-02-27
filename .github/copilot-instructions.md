# PARABLE Project Rules & Production Specs

## 1. Tech Stack Requirements
- **Framework:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Backend:** Supabase (Auth, Database, Storage).
- **Animation:** Framer Motion (use sparingly for performance).
- **State/Fetching:** TanStack Query (React Query) for all server state. No manual useEffect fetching.

## 2. Coding Standards (Live App Specs)
- **Pagination:** Always use cursor-based pagination for lists (Posts, Comments).
- **Optimistic UI:** Implement optimistic updates for Likes, Follows, and Comments using TanStack Query.
- **Error Handling:** Every async function must have a try/catch block with user-friendly "Toast" notifications.
- **Images:** Always use `next/image` for layout stability and lazy loading.
- **Security:** Ensure all Supabase queries respect Row Level Security (RLS). Never trust `user_id` from the client; fetch it from `supabase.auth.getUser()`.

## 3. Visual Identity (The Sanctuary Aesthetic)
- **Theme:** "Tech-Noir" / Cyberpunk. 
- **Colors:** Background: #000000, Accents: #00f2ff (Cyan), Borders: #ffffff1a (10% white).
- **FX:** Use `backdrop-blur-md`, `border-[#00f2ff]/18`, and subtle `motion` transitions.
