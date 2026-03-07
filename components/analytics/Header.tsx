"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  LogOut, 
  Shield,
  ChevronDown,
  Menu,
  X,
  Grid,
} from "lucide-react";

const ACCENT = "#d63031";

export default function Header() {
  const [user, setUser] = useState<{ name?: string | null; email?: string | null }>({});
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) setUser(session.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            toast.success("Session Terminated");
          },
        },
      });
    } catch (error) {
      toast.error("Logout failed");
      setLoading(false);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Grid },
    { name: "Newsletter", href: "/newsletter", icon: Shield },
  ];

  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";
  const shouldHideText = scrolled && !isHovered;

  return (
    <>
      <style jsx global>{`
    
        .active-glow {
          filter: drop-shadow(0 0 5px ${ACCENT});
        }
        .nav-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <header 
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center nav-transition ${scrolled ? "pt-4" : "pt-0"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`nav-transition flex items-center justify-between
            ${scrolled 
              ? "bg-black rounded-full px-3 py-2 w-auto max-w-[95vw] min-w-[300px]" 
              : " rounded-none px-6 py-4 border-t-0 border-x-0"
            }
            ${isMenuOpen || isMobileMenuOpen ? "overflow-visible" : "overflow-hidden"} 
          `}
        >
          {/* Logo - Left Section */}
          <Link href="/" className="flex-shrink-0 px-2">
            <div className={`nav-transition relative ${scrolled ? "w-8 h-8 rounded-lg overflow-hidden" : "w-28 sm:w-36"}`}>
              <Image
                src="/assets/navbar/Website.png"
                alt="Logo"
                width={140}
                height={45}
                priority
                className={`nav-transition ${scrolled ? "scale-150 translate-x-[-15%]" : "scale-100"}`}
              />
            </div>
          </Link>

          {/* Nav Items (Desktop) - Center Section */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center nav-transition rounded-full group
                    ${shouldHideText ? "p-3" : "px-4 py-2 gap-3"}
                    ${isActive ? "text-white bg-red-500/10" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}
                  `}
                >
                  <item.icon 
                    size={20} 
                    className={`nav-transition group-hover:scale-110 ${isActive ? "text-red-500 active-glow" : ""}`} 
                  />
                  
                  <span 
                    className={`text-sm font-bold nav-transition overflow-hidden whitespace-nowrap
                      ${shouldHideText ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"}
                    `}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section - User Profile & Mobile Menu */}
          <div className="flex items-center gap-1 sm:gap-4">
            {!shouldHideText && <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />}

            {/* User Profile Section */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center nav-transition rounded-full bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/30
                  ${shouldHideText ? "p-1" : "p-1 pr-3 gap-3"}
                `}
              >
                <div className="relative">
                  <div className={`nav-transition rounded-full bg-gradient-to-tr from-[#8e1a1a] to-[#d63031] flex items-center justify-center font-black text-white
                    ${scrolled ? "w-8 h-8 text-[10px]" : "w-9 h-9 text-xs"}`}
                  >
                    {initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                </div>

                <div className={`nav-transition overflow-hidden hidden lg:block text-left
                  ${shouldHideText ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"}
                `}>
                  <p className="text-[11px] font-bold text-zinc-100 leading-none truncate">{user.name || "Administrator"}</p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1 tracking-widest uppercase">Online</p>
                </div>
                {!shouldHideText && <ChevronDown size={14} className="text-zinc-600 hidden sm:block" />}
              </button>

              {/* User Dropdown */}
              {isMenuOpen && (
                <div className={`absolute right-0 w-52 rounded-2xl border border-white/10 bg-[#09090b]/95 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-4 z-[60]
                  ${scrolled ? "top-[120%]" : "top-full mt-4"}
                `}>
                  <div className="px-3 py-2 mb-1 border-b border-white/5 lg:hidden">
                     <p className="text-xs font-bold text-white truncate">{user.name || "Admin"}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all group disabled:opacity-50"
                  >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {loading ? "Exiting..." : "Disconnect"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 p-4  rounded-3xl space-y-2 animate-in slide-in-from-top-5 z-50">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                    pathname === item.href ? "bg-red-500/10 text-white" : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <item.icon size={22} className={pathname === item.href ? "text-red-500" : ""} />
                  <span className="font-bold text-sm uppercase tracking-wide">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
}