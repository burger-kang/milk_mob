"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const PRODUCT_LINKS = [
  { href: "/upload", label: "Upload" },
  { href: "/me", label: "My Mob" },
  { href: "/mobs", label: "Mobs" },
  { href: "/search", label: "Search" },
];

const PITCH_LINKS = [
  { href: "/architecture", label: "Architecture" },
  { href: "/impact", label: "Impact" },
  { href: "/whats-next", label: "What's Next" },
  { href: "/operator/review", label: "Operator" },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all",
          scrolled ? "backdrop-blur-md bg-paper/85 border-b border-edge" : "bg-paper",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Logo />
            <span className="hidden sm:inline text-[15px] font-medium tracking-tight">
              got milk <span className="font-display text-[18px] not-italic-dot">mob</span>
              <span className="text-mood">?</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {PRODUCT_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} active={pathname === l.href || pathname.startsWith(l.href + "/")}>
                {l.label}
              </NavLink>
            ))}
            <span className="mx-2 h-4 w-px bg-edge" aria-hidden />
            <span className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mr-1">Behind</span>
            {PITCH_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} active={pathname === l.href || pathname.startsWith(l.href + "/")}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md ring-edge bg-paper-2/60 hover:bg-paper-2 text-whisper hover:text-ink text-[13px] transition-colors"
              aria-label="Search the campaign"
            >
              <SearchIcon />
              <span>Search the campaign</span>
              <kbd className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper text-whisper-2">⌘K</kbd>
            </button>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-ink text-paper hover:bg-ink-2 text-[13px] font-medium transition-colors"
            >
              Drop a clip
              <ArrowIcon />
            </Link>
          </div>
        </div>

        {/* Mobile bottom row of nav links */}
        <div className="md:hidden border-t border-edge px-3 py-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-[12px] whitespace-nowrap">
            {[...PRODUCT_LINKS, ...PITCH_LINKS].map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                active={pathname === l.href || pathname.startsWith(l.href + "/")}
                compact
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={submitSearch}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-paper rounded-xl shadow-lift ring-edge-strong overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-edge">
              <SearchIcon />
              <input
                autoFocus
                type="text"
                placeholder="slow-motion milk pour, golden hour, outdoor…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-whisper-2"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper-2 text-whisper-2">esc</kbd>
            </div>
            <div className="px-4 py-3 text-[12px] text-whisper">
              Cross-modal search across visual, audio, and transcription on every video in the campaign. Powered by Marengo 3.0.
            </div>
            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
              {[
                "kids laughing",
                "skate trick at sunset",
                "milk pour slow-mo",
                "campfire toast",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setSearchQuery(q);
                  }}
                  className="text-[12px] px-2.5 py-1 rounded-full ring-edge hover:bg-paper-2 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  active,
  compact,
  children,
}: {
  href: string;
  active?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md font-medium transition-colors",
        compact ? "h-7 px-2 text-[12px]" : "h-9 px-3 text-[13px] inline-flex items-center",
        active
          ? "bg-paper-2 text-ink"
          : "text-whisper hover:text-ink hover:bg-paper-2/60",
      )}
    >
      {children}
    </Link>
  );
}

function Logo() {
  return (
    <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink text-paper">
      <span className="font-display italic text-[18px] leading-none -translate-y-[1px]">m</span>
      <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-mood" aria-hidden />
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
