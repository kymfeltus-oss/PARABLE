import InstagramCommentCleanerPanel from "@/components/tools/InstagramCommentCleanerPanel";

export const metadata = {
  title: "Instagram Comment Cleaner",
  description: "External utility to batch-delete your Instagram comments via browser console.",
};

export default function InstagramCommentCleanerPage() {
  return (
    <div className="min-h-screen bg-[#0f1011]">
      <InstagramCommentCleanerPanel />
    </div>
  );
}
