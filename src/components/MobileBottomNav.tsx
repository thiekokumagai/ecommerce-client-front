import { Home, Package, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/pedidos", label: "Pedidos", icon: Package },
  { to: "/perfil", label: "Perfil", icon: User },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background md:hidden">
      <div className="grid grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
