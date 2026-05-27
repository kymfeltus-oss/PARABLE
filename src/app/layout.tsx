import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientRootShell from "@/components/layout/ClientRootShell";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {process.env.NODE_ENV === "development" ? (
          <Script src="/dev-react-devtools-guard.js" strategy="lazyOnload" />
        ) : null}
      </head>
      <body
        className={`${inter.className} bg-black text-white antialiased`}
        data-git-sha={process.env.NEXT_PUBLIC_GIT_SHA ?? ""}
        suppressHydrationWarning
      >
        <ClientRootShell>{children}</ClientRootShell>
      </body>
    </html>
  );
}
