"use client";

import "./sparkles.css";

export default function Sparkles() {
  return (
    <div className="sparkles-root" aria-hidden="true">
      <div className="sparkles-stars primary" />
      <div className="sparkles-stars secondary" />
      <div className="sparkles-haze" />
    </div>
  );
}
