"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function CreatorDirectory() {
  const creators = [
    {
      name: "Bishop T.D. Jakes",
      slug: "td-jakes",
      avatar: "/td_avatar.png",
      banner: "/td_banner.png",
      role: "Pastor • Author • Influencer",
    },
    {
      name: "Kirk Franklin",
      slug: "kirk-franklin",
      avatar: "/kirk_avatar.png",
      banner: "/kirk_banner.png",
      role: "Gospel Artist • Producer",
    },
    {
      name: "Lauren Daigle",
      slug: "lauren-daigle",
      avatar: "/lauren-daigle.jpg",
      banner: "/lauren-daigle-banner.jpg",
      role: "CCM Artist • Worship Leader",
    },
    {
      name: "Pastor Stevenson",
      slug: "pastor-stevenson",
      avatar: "/steven-furtick.jpg",
      banner: "/steven-furtick-banner.jpg",
      role: "Prophet • Teacher • Revivalist",
    },
    {
      name: "Mike Todd",
      slug: "mike-todd",
      avatar: "/pastor_mike.jpg",
      banner: "/pastor_mike.jpg",
      role: "Pastor • Speaker",
    },
    {
      name: "Steven Furtick",
      slug: "steven-furtick",
      avatar: "/steven-furtick.jpg",
      banner: "/steven-furtick-banner.jpg",
      role: "Pastor • Leader",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="px-6 mt-10">
        <h1 className="text-4xl font-extrabold text-[#53fc18] mb-6">
          Featured Creators
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {creators.map((c, i) => (
            <Link
              key={i}
              href={`/creator/${c.slug}`}
              className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] hover:scale-[1.03] transition"
            >
              {/* BANNER */}
              <div className="relative h-28 w-full overflow-hidden">
                <Image
                  src={c.banner}
                  alt={c.name}
                  fill
                  className="object-cover opacity-70"
                />
              </div>

              {/* AVATAR + INFO */}
              <div className="p-3 -mt-10 flex flex-col items-center">
                <Image
                  src={c.avatar}
                  alt={c.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-[#0d0d0d] shadow-xl object-cover"
                />
                <h3 className="text-sm font-bold text-center mt-3">{c.name}</h3>
                <p className="text-[11px] text-gray-400 text-center">{c.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
