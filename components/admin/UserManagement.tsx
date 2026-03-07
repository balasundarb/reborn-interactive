"use client";
// components/admin/UserManagement.tsx
import React, { useState, useTransition, useCallback } from "react";
import {
  Users, UserPlus, Trash2, KeyRound, Search,
  Loader2, X, Eye, EyeOff, ShieldAlert, CheckCircle2,
  Mail, User, Lock, AlertTriangle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role?: string;
}

type ModalMode = "add" | "password" | "delete" | null;

interface Props {
  currentUserId: string;
  initialUsers: UserRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ background: `hsl(${hue}, 45%, 32%)` }}
    >
      {initials}
    </div>
  );
}

function InputField({
  icon: Icon, type = "text", placeholder, value, onChange, rightSlot, autoFocus,
}: {
  icon: React.ElementType; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  rightSlot?: React.ReactNode; autoFocus?: boolean;
}) {
  return (
    <div className="group relative">
      <Icon
        size={17}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors pointer-events-none"
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all text-sm"
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
        >
          <X size={17} />
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: UserRecord) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !password) return toast.error("All fields are required");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create user");
        toast.success(`${name} was added successfully`);
        onSuccess(data.user);
        onClose();
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight italic">
            ADD <span className="text-[#d63031]">USER</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">Create a new account in the system</p>
        </div>

        <div className="space-y-3">
          <InputField icon={User} placeholder="Full Name" value={name} onChange={setName} autoFocus />
          <InputField icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />
          <InputField
            icon={Lock}
            type={showPass ? "text" : "password"}
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={setPassword}
            rightSlot={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-white transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#d63031] hover:bg-[#b02828] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={17} /> Create User</>}
        </button>
      </div>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const match = password.length >= 8 && confirm === password;
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = () => {
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, newPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update password");
        toast.success(`Password updated for ${user.name}`);
        onClose();
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  };

  const toggleSlot = (
    <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-white transition-colors">
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <Modal onClose={onClose}>
      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight italic">
            CHANGE <span className="text-[#d63031]">PASSWORD</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Updating password for{" "}
            <span className="text-white font-semibold">{user.name}</span>
          </p>
        </div>

        <div className="space-y-3">
          <InputField
            icon={Lock}
            type={showPass ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={setPassword}
            autoFocus
            rightSlot={toggleSlot}
          />

          {/* Confirm field — needs its own border-color logic */}
          <div className="group relative">
            <Lock
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors pointer-events-none"
            />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full pl-10 pr-10 py-3.5 bg-white/5 border rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 transition-all text-sm ${
                mismatch
                  ? "border-red-500/60 focus:ring-red-500/20"
                  : match
                  ? "border-emerald-500/60 focus:ring-emerald-500/20"
                  : "border-white/10 focus:ring-[#d63031]/40 focus:border-[#d63031]/40"
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {match && <CheckCircle2 size={16} className="text-emerald-400" />}
              {mismatch && <X size={16} className="text-red-400" />}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || !match}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#d63031] hover:bg-[#b02828] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="animate-spin" size={18} /> : <><KeyRound size={17} /> Update Password</>}
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({
  user, onClose, onSuccess,
}: { user: UserRecord; onClose: () => void; onSuccess: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete user");
        toast.success(`${user.name} was removed`);
        onSuccess(user.id);
        onClose();
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-8 space-y-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#d63031]/10 border border-[#d63031]/25 flex items-center justify-center">
          <AlertTriangle className="text-[#d63031]" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight italic">
            DELETE <span className="text-[#d63031]">USER</span>
          </h3>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            This will permanently remove{" "}
            <span className="text-white font-semibold">{user.name}</span> and all
            associated data. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-semibold hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#d63031] hover:bg-[#b02828] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={17} /> Delete</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserManagement({ currentUserId, initialUsers }: Props) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const refresh = useCallback(() => {
    startRefresh(async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (res.ok) setUsers(data.users ?? []);
      } catch {
        toast.error("Failed to refresh users");
      }
    });
  }, []);

  const openModal = (mode: ModalMode, user?: UserRecord) => {
    setSelectedUser(user ?? null);
    setModal(mode);
  };
  const closeModal = () => { setModal(null); setSelectedUser(null); };

  // Optimistic updates
  const handleAdded = (user: UserRecord) => setUsers((prev) => [user, ...prev]);
  const handleDeleted = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060b14] p-6 md:p-10">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#d63031]/15 border border-[#d63031]/25 flex items-center justify-center">
              <ShieldAlert className="text-[#d63031]" size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Admin Panel
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight italic">
            USER <span className="text-[#d63031]">MANAGEMENT</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            {users.length} registered account{users.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-5 py-3 bg-[#d63031] hover:bg-[#b02828] text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-[0.97]"
          >
            <UserPlus size={17} /> Add User
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-3 bg-slate-900/60 border border-white/8 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/30 focus:border-[#d63031]/30 transition-all text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-slate-900/50 border border-white/8 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[2.5rem_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/5">
          <span />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Name</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Email</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 text-right pr-1">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
            <Users size={38} strokeWidth={1} />
            <p className="text-sm">{search ? "No users match your search" : "No users found"}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.018] transition-colors group"
              >
                <Avatar name={user.name} />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                    {user.id === currentUserId && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#d63031]/15 text-[#d63031] border border-[#d63031]/25 shrink-0">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 sm:hidden truncate">{user.email}</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>

                <p className="hidden sm:block text-slate-400 text-sm truncate">{user.email}</p>

                {/* Actions — always visible on mobile, hover on desktop */}
                <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal("password", user)}
                    title="Change password"
                    className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <KeyRound size={15} />
                  </button>
                  <button
                    onClick={() => openModal("delete", user)}
                    disabled={user.id === currentUserId}
                    title={user.id === currentUserId ? "Cannot delete your own account" : "Delete user"}
                    className="p-2 rounded-lg text-slate-500 hover:text-[#d63031] hover:bg-[#d63031]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === "add" && (
        <AddUserModal onClose={closeModal} onSuccess={handleAdded} />
      )}
      {modal === "password" && selectedUser && (
        <ChangePasswordModal user={selectedUser} onClose={closeModal} />
      )}
      {modal === "delete" && selectedUser && (
        <DeleteModal user={selectedUser} onClose={closeModal} onSuccess={handleDeleted} />
      )}
    </div>
  );
}