"use client";
import React, { useState, useTransition } from "react";
import {
  Search, Trash2, X, Download, RefreshCw,
  Mail, Users, CheckSquare, Square,
} from "lucide-react";
import { toast } from "sonner";

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface Props {
  subscribers: Subscriber[];
  selected: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onDeleted: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SubscribersList({
  subscribers, selected, onSelectionChange, onDeleted, onRefresh, isRefreshing,
}: Props) {
  const [search, setSearch] = useState("");
  const [deleting, startDelete] = useTransition();

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selected);
      filtered.forEach((s) => next.delete(s.id));
      onSelectionChange(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((s) => next.add(s.id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };

  const handleDelete = (sub: Subscriber) => {
    startDelete(async () => {
      try {
        const res = await fetch("/api/admin/newsletter/subscribers", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sub.id }),
        });
        if (!res.ok) throw new Error("Failed to remove subscriber");
        toast.success(`${sub.email} removed`);
        onDeleted(sub.id);
        const next = new Set(selected);
        next.delete(sub.id);
        onSelectionChange(next);
      } catch {
        toast.error("Failed to remove subscriber");
      }
    });
  };

  const exportCSV = () => {
    const rows = ["email,subscribed_at", ...subscribers.map(
      (s) => `${s.email},${new Date(s.createdAt).toISOString()}`
    )].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `newsletter-subscribers-${Date.now()}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/8">
        <div>
          <p className="text-white font-bold text-sm flex items-center gap-2">
            <Users size={15} className="text-[#d63031]" />
            Subscribers
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {subscribers.length} total · {selected.size} selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            title="Export CSV"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Download size={14} />
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/8">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subscribers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-7 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:ring-1 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Select All row */}
      {filtered.length > 0 && (
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all border-b border-white/8"
        >
          {allFilteredSelected
            ? <CheckSquare size={13} className="text-[#d63031]" />
            : <Square size={13} />}
          {allFilteredSelected ? "Deselect all" : `Select all (${filtered.length})`}
        </button>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600 gap-2">
            <Mail size={28} strokeWidth={1} />
            <p className="text-xs">{search ? "No match found" : "No subscribers yet"}</p>
          </div>
        ) : (
          filtered.map((sub) => (
            <div
              key={sub.id}
              onClick={() => toggleOne(sub.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer group transition-all ${
                selected.has(sub.id) ? "bg-[#d63031]/8" : "hover:bg-white/4"
              }`}
            >
              <div className="shrink-0">
                {selected.has(sub.id)
                  ? <CheckSquare size={13} className="text-[#d63031]" />
                  : <Square size={13} className="text-slate-600 group-hover:text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate font-medium transition-colors ${
                  selected.has(sub.id) ? "text-white" : "text-slate-300"
                }`}>
                  {sub.email}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {new Date(sub.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(sub); }}
                disabled={deleting}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-[#d63031] hover:bg-[#d63031]/10 transition-all disabled:opacity-30"
                title="Remove subscriber"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
