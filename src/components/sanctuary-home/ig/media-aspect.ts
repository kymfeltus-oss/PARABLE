import type { DemoHomeFeedPost } from "@/lib/demo-personas";

export type IgMediaAspect = "square" | "portrait" | "reel";

export function resolveIgMediaAspect(post: DemoHomeFeedPost): IgMediaAspect {
  if (post.post_type === "video") return "reel";
  return "square";
}

export function igMediaAspectClass(aspect: IgMediaAspect): string {
  switch (aspect) {
    case "reel":
      return "aspect-[9/16] max-h-[min(78vh,720px)]";
    case "portrait":
      return "aspect-[4/5]";
    default:
      return "aspect-square";
  }
}
