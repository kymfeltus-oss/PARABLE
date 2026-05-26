"use client";
import { BRAND } from "@/constants/branding";

export default function ParableLogo() {
  return (
    <img 
      src={BRAND.logoAsset} 
      alt="Parable Logo" 
      className="w-full h-auto object-contain"
    />
  );
}