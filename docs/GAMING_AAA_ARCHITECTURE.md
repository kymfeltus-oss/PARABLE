# PARABLE gaming: “Games for the Web” (2026-oriented)

**Web mini-games** live in a document: DOM timers and 2D canvas. **Games for the web** live in a **GPU-driven engine** inside your shell: PBR lighting, physics, skeletal animation, and netcode that can later be **server-authoritative**. PARABLE should be treated as a **gaming platform** with React/Next as **chrome** (auth, feed, commerce), not as the simulation host.

---

## 0. Engine choice (pick per SKU)

| Target | Engine | Role |
|--------|--------|------|
| **Browser + mobile web (primary)** | **Three.js + `WebGPURenderer`** | Industry-standard JS 3D; PBR; fits Next.js via **React Three Fiber (R3F)**. Repo entry: `src/components/engine/`, route **`/play/engine`**. |
| **Alt browser engine** | **PlayCanvas** | Hosted editor + runtime; good for teams that want a visual pipeline first. |
| **Console / blockbuster fidelity** | **Unreal Engine 5** | Lumen, Nanite; ship **pixel streaming** or native clients; auth/inventory still **Supabase**. |
| **Cross-platform (especially mobile native)** | **Unity** | Large asset ecosystem; same backend contracts (GLB export, REST/RPC). |

**Rule:** Stop trying to “upgrade” a blue grid into GTA. **New vertical slices** (Sanctuary block, court, drive loop) ship in the **3D scene**; 2D demos remain legacy/UX references until replaced.

---

## 1. Recommended stack (today’s standard)

| Layer | Technology | Why |
|-------|------------|-----|
| **Renderer** | Three.js **WebGPU** (fallback WebGL2) | Uses the **GPU** for lighting and high draw counts. |
| **Framework** | **React Three Fiber** | Same React app as PARABLE; 3D as a subtree. |
| **Physics** | **Rapier** (WASM) or **Ammo.js** | Ball trajectory, tackles, car suspension—**forces**, not `if (green) score++`. |
| **Input** | **Gamepad API** + pointer / **Pointer Lock** (where appropriate) | **Pro-stick interpreter:** analog samples → direction + magnitude per frame. |
| **Models** | **glTF / GLB** (Ready Player Me–compatible pipelines) | One Imago asset path across modes. |
| **Economy / identity** | **Supabase** (Postgres + RLS + Auth) | Source of truth for XP, Seeds, inventory, bans. |
| **Realtime** | **Supabase Realtime** | Lobbies, presence, leaderboards—**not** every physics tick. |
| **Low-latency rooms (optional)** | **Hathora** / custom relay | Competitive sessions & tick sync when you outgrow “event-only” realtime. |
| **Anti-cheat (competitive)** | **Authoritative validation** | **Edge Functions** or dedicated game server verifies outcomes; client never owns final score/Influence. |

---

## 2. Graphics: PBR + post (AAA read)

- **PBR workflow:** `MeshStandardMaterial` / `MeshPhysicalMaterial` + **roughness/metalness** maps; **IBL** (environment maps) so metal reads as metal and skin reads as skin.
- **Post stack (enable per scene):** **Bloom** (auras, neon), **depth of field** (cinematic beats), **SSAO or GTAO-class AO** (contact shadow / weight). Implement via Three postprocessing compatible with your active renderer (WebGPU node pipeline vs WebGL passes—test per release).
- **Lighting:** Movable key + fill; **shadow maps** first; path-traced beauty passes are **UE5/streaming** tier, not a hard requirement for v1 web.

---

## 3. Physics, hit volumes, combat

- **Character motion:** **physics-based controller** (capsule + friction + slope), not `x++` grid slide.
- **Ball / projectile:** **continuous collision** + spin; rim contacts from **mesh colliders**, not dice rolls.
- **Combat / shields:** **hurt-box vs hit-box** (or mesh raycast): “Shield of Faith” blocks only on **geometric intersection** of projectile path with shield volume.

---

## 4. Multiplayer & world state

- **Client-side prediction** for local avatar; **reconciliation** when authoritative state arrives.
- **Snapshot interpolation** for remote players.
- **Server authority:** validated goals, pickups, match end—persist via **idempotent** RPCs / rows (see `supabase/schema-gaming-vault.sql` sketch).
- **Spatial audio:** **Web Audio `PannerNode`** (or engine audio) so voices/music pan with avatar position in Sanctuary.

---

## 5. AI (replace giant if/else)

- **NavMesh:** walkable regions for NPCs and vehicles.
- **Behavior trees:** perceive → decide → act (chase, contest, help defense).
- **Context:** read player **Aura / Influence** from synced state (e.g. Supabase) to bias NPC interest (outreach ops vs ignore).
- **Sports AI:** gap logic, help rotations, tendency memory from **`match_history`**-style analytics.

---

## 6. Imago asset pipeline (universal avatar)

1. **Standardize on GLB** (material variants optional).
2. **Skeletal retargeting** so one run cycle works in streetwear or armor.
3. **Texture streaming / LOD:** high mips when camera-near; low when far.
4. **Bridge:** fetch profile / `imago_assets` (see vault SQL) → **`useGLTF`** (or loader) → **SkinnedMesh** in scene; updates on inventory change via Realtime or optimistic local + server confirm.

---

## 7. Immediate migration blueprint (three steps)

1. **World canvas** — Treat **`/play/engine`** as the seed **3D scene wrapper** (already wired to **WebGPU-first** `createParableRenderer`). New environments load **here**, not inside 2D `canvas` game files.
2. **Swap draw for components** — Replace `fillRect` city blocks with **instanced meshes** or imported **.glb** “city kit / stadium kit.”
3. **Input manager** — Centralize **gamepad + keyboard + pointer** into an **input vector** consumed by camera + pro-stick systems (existing `useGamepadConnected` is a stub; extend into an action map).

---

## 8. Code entry points in this repo

| What | Where |
|------|--------|
| WebGPU/WebGL bootstrap | `src/components/engine/createParableRenderer.ts` |
| PBR + shadows demo scene | `src/components/engine/ParableEngineScene.tsx` |
| Canvas shell | `src/components/engine/ParableEngineRoot.tsx` |
| **Lab route** | **`/play/engine`** |
| DB sketch (Imago, `game_states`, `match_history`, …) | `supabase/schema-gaming-vault.sql` |
| **2026 tables** (`imago_inventory`, `pro_stick_analytics`, `world_influence`, `shed_room_sessions`) | `supabase/schema-gaming-2026.sql` |

---

## 9. ECS & compute (later milestones)

- **ECS:** entities = components; systems run on a **fixed timestep** in `useFrame` or a **worker**—React only mounts/unmounts the canvas and passes props.
- **Compute shaders:** GPU-side work for particles/broad-phase is a **follow-on**; keep **input timestamps** on CPU for deterministic pro-stick grading.

---

## 10. “Dated vs AAA” (one-pager for stakeholders)

| Dated (web game) | AAA-oriented (game for the web) |
|------------------|----------------------------------|
| Grid `x+1, y+1` | Kinematic / dynamic **physics** controller |
| 2D sprites | **Rigged** high-poly LOD meshes |
| Flat lighting | **PBR** + shadows + post |
| Button mash | **Hit volumes** + timed analog **windows** |
| Client-trusted score | **Server-validated** results + RLS |

---

*Canvas titles under `/gaming/play/*` remain **playable prototypes**. Product direction: **new fidelity and competitive integrity** land in the **engine path** above.*
