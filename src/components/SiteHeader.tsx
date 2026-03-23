import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, LayoutGrid } from "lucide-react";
import logo from "@/assets/logo.webp";
import { useCart } from "@/contexts/CartContext";
import CategoriesMenu from "@/components/CategoriesMenu";

const SiteHeader = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { totalItems, setIsCartOpen, searchTerm, setSearchTerm, setSelectedCategory } = useCart();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setSelectedCategory(null);
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] border-b border-border bg-background/95 px-4 pb-3 pt-3 shadow-sm backdrop-blur-md md:hidden">
        <div className="mx-auto max-w-7xl space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className="rounded-full p-1.5 text-muted-foreground"
              aria-label="Categorias"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={logo} alt="Pod & Mais" className="h-10 w-10 object-contain" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-1.5 text-muted-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Faça sua busca"
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
            />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 shadow-sm backdrop-blur-md md:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Pod & Mais" className="h-20 w-20 object-contain" />
            </Link>

           
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Faça sua busca"
                className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none lg:w-52"
              />
              <button type="button" className="text-primary hover:text-primary/80" aria-label="Buscar">
                <Search className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Categorias"
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
          </div>
        </div>
      </header>

      <CategoriesMenu open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </>
  );
};

export default SiteHeader;