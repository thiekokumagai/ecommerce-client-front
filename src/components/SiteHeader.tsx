import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, Info, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.webp";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Categorias", href: "/#categorias" },
  { label: "Promoções", href: "/#promocoes" },
  { label: "Produtos", href: "/#produtos" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  const contactHref = location.pathname === "/" ? "#contato" : "/#contato";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Pod & Mais" className="h-16 w-16 object-contain md:h-20 md:w-20" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 md:flex">
            <input
              type="text"
              placeholder="Faça sua busca"
              className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none lg:w-52"
            />
            <button className="text-primary hover:text-primary/80">
              <Search className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          <a
            href="https://wa.me/5567991032937"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 sm:flex"
          >
            <MessageCircle className="h-5 w-5" />
          </a>

          <a href={contactHref} className="rounded-full p-2 text-primary transition-colors hover:bg-secondary">
            <Info className="h-5 w-5" />
          </a>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <input
              type="text"
              placeholder="Faça sua busca"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            <Search className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <a
              href={contactHref}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              Contato
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;