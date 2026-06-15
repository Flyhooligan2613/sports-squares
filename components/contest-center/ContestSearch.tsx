"use client";

import { Search } from "lucide-react";

interface ContestSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContestSearch({ value, onChange }: ContestSearchProps) {
  return (
    <div className="cc-search">
      <Search className="cc-search-icon" size={18} aria-hidden />
      <input
        type="search"
        className="cc-search-input"
        placeholder="Search contests, sports, or invite code…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search contests"
      />
    </div>
  );
}
