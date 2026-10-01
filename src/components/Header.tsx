"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";

const nav = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=knitwear", label: "Knitwear" },
  { href: "/shop?category=outerwear", label: "Outerwear" },
  { href: "/shop?category=dresses", label: "Dresses" },
  { href: "/shop?category=trousers", label: "Trousers" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/passport", label: "Passports" },
  { href: "/stores", label: "Stores" },
];

export default function Header() {
  const { count, open } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  // panels remember the page they were opened on, so navigating closes them
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchPath, setSearchPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const searchOpen = searchPath === pathname;
  const setMenuOpen = (fn: (v: boolean) => boolean) => setMenuPath(fn(menuOpen) ? pathname : null);
  const setSearchOpen = (fn: (v: boolean) => boolean) => setSearchPath(fn(searchOpen) ? pathname : null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    setSearchPath(null);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <header className="header">
      <div className="header-row">
        <button className="icon-btn menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu">
          <span className="burger" aria-hidden="true" />
        </button>
        <Link href="/" className="brand">Auro</Link>
        <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenuPath(null)}>{n.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="text-btn" onClick={() => setSearchOpen((v) => !v)} aria-expanded={searchOpen}>
            Search
          </button>
          <button className="text-btn" onClick={open} aria-label={`Open bag, ${count} items`}>
            Bag ({count})
          </button>
        </div>
      </div>
      {searchOpen && (
        <form className="search-bar" role="search" onSubmit={onSearch}>
          <input ref={inputRef} name="q" type="search" placeholder="Search cashmere, linen, coat…" aria-label="Search products" />
          <button type="submit" className="text-btn">Search</button>
        </form>
      )}
    </header>
  );
}
