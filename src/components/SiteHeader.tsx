import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, LayoutGrid } from "lucide-react";
import logo from "@/assets/logo.webp";
import { useCart } from "@/contexts/CartContext";
import CategoriesMenu from "@/components/CategoriesMenu";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Categorias", href: "/#categorias" },
  { label: "Promoções", href: "/#promocoes" },
  { label: "Produtos", href: "/#produtos" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] border-b border-border bg-background/95 px-4 pb-3 pt-3 shadow-sm backdrop-blur-md md:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              type="text"
              placeholder="Faça sua busca"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-md md:top-0">
        <div className="mx-auto mt-[74px] flex h-16 max-w-7xl items-center justify-between px-4 md:mt-0 md:h-20 md:px-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Pod & Mais" className="h-12 w-12 object-contain md:h-20 md:w-20" />
            </Link>
          </div>

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

          <div className="flex items-center gap-1 md:gap-2">
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
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Abrir categorias"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>

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
                href="/#contato"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                Contato
              </a>
            </nav>
          </div>
        )}
      </header>

      <CategoriesMenu open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </>
  );
};

export default SiteHeader;