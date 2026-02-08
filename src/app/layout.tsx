"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

// Note: Metadata must be handled differently in Client Components or 
// defined in a separate 'metadata.ts' file if needed for SEO.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // LIST OF PROTECTED PATHS: No menu allowed here
  const entryPages = [
    "/",               // Flash / Landing Page
    "/welcome",        // Welcome Page
    "/login",          // Login Page
    "/create-account"  // Create Account Page
  ];

  const shouldHideNav = entryPages.includes(pathname);

  return (
    <html lang="en" className="dark">
      <body 
        className={`${inter.className} bg-black text-white antialiased selection:bg-[#00f2ff] selection:text-black`}
      >
        {/* Render your page content */}
        {children}

        {/* Only render navigation if NOT on an entry page */}
        {!shouldHideNav && <BottomNav />}
      </body>
    </html>
  );
}