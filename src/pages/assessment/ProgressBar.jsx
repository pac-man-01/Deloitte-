import React from "react";

export default function ProgressBar({ percent }) {
  return (
    <div className="h-3 bg-zinc-800 rounded-lg overflow-hidden w-full mt-4 mb-2 shadow-inner">
      <div
        className="h-full bg-white transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}