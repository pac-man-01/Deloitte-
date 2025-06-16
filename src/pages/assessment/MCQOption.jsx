import React from "react";
import cn from "../../utils/cn";

export default function MCQOption({ option, checked, onChange, name }) {
  return (
    <li>
      <label
        className={cn(
          "flex items-center gap-3 w-full cursor-pointer rounded-xl border border-zinc-800 px-4 py-3 transition-all duration-150",
          checked
            ? "bg-white text-black font-bold shadow-lg border-white ring-2 ring-white"
            : "bg-zinc-900 text-white hover:bg-zinc-950 hover:border-white/80"
        )}
      >
        <input
          type="radio"
          name={name}
          value={option}
          checked={checked}
          onChange={onChange}
          className="hidden"
        />
        <span
          className={cn(
            "relative flex items-center justify-center w-5 h-5 rounded-full border-2 mr-2 flex-shrink-0",
            checked ? "bg-white border-white" : "border-white"
          )}
        >
          {checked && <span className="block w-2.5 h-2.5 rounded-full bg-black"></span>}
        </span>
        <span className="text-sm">{option}</span>
      </label>
    </li>
  );
}