import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Docs", href: "https://docs.firecrawl.dev", external: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <span className="font-mono text-xs font-bold text-primary-foreground">R</span>
          </div>
          <span className="font-mono text-sm text-foreground">Research Hub</span>
        </div>

        <div className="hidden items-center gap-1 font-mono text-xs tracking-wide text-muted-foreground sm:flex">
          <span className="text-terminal-dim">CONTENT RESEARCH HUB</span>
        </div>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className="flex items-center justify-center sm:hidden text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-6 py-4 sm:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
