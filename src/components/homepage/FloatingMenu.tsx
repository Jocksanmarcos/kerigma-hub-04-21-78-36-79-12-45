import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicSiteLogo } from "@/components/ui/public-site-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface FloatingMenuProps {
  transparent?: boolean;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ transparent = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Início", href: "/" },
    { label: "Sobre", href: "/sobre" },
    { label: "Células", href: "/celulas" },
    { label: "Agenda", href: "/agenda" },
    { label: "Ensino", href: "/site/ensino" },
    { label: "Galeria", href: "/galeria" },
    { label: "Contato", href: "/contato" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  const menuBg = transparent && !scrolled
    ? "bg-black/20 backdrop-blur-md border-white/10"
    : "bg-background/95 backdrop-blur-sm border-border/40";

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      transparent ? "absolute" : "relative"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex items-center justify-between h-16 mt-4 rounded-full border transition-all duration-300",
          menuBg
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 pl-4">
            <PublicSiteLogo className="h-8 w-auto shrink-0" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative",
                  isActive(item.href)
                    ? transparent && !scrolled
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-primary border-b-2 border-primary pb-1"
                    : transparent && !scrolled
                      ? "text-white/90 hover:text-white"
                      : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 pr-4">
            <ThemeToggle />

            <Link to="/auth" className="hidden sm:flex">
              <Button 
                variant={transparent && !scrolled ? "outline" : "default"} 
                size="sm" 
                className={cn(
                  "flex items-center gap-2",
                  transparent && !scrolled && "border-white/60 text-white hover:bg-white hover:text-primary"
                )}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? (
                <X className={cn("h-6 w-6", transparent && !scrolled ? "text-white" : "text-foreground")} />
              ) : (
                <Menu className={cn("h-6 w-6", transparent && !scrolled ? "text-white" : "text-foreground")} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-background/95 backdrop-blur-sm border border-border/40 rounded-2xl shadow-xl">
            <div className="px-4 pt-4 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/auth" className="block mt-4">
                <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};