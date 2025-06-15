import React from "react";

export default function Loading({ show, text = "Loading..." }) {
  if (!show) return null;
  return (
    <div className="flex flex-col items-center justify-center mt-16 mb-8 text-white">
      <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin mb-3"></div>
      <p className="text-lg font-medium tracking-wider">{text}</p>
    </div>
  );
}