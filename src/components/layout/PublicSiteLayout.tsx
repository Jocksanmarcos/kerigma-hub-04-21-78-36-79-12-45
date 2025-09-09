import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicSiteLogo } from "@/components/ui/public-site-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLiveEditor } from "@/components/live-editor/LiveEditorProvider";

// Safe access to LiveEditor (works even when provider isn't mounted)
const useSafeLiveEditor = () => {
  try {
    return useLiveEditor();
  } catch {
    return {
      editMode: false,
      exitEditMode: () => {}
    } as { editMode: boolean; exitEditMode: () => void };
  }
};

interface PublicSiteLayoutProps {
  children: React.ReactNode;
}

const PublicSiteLayout: React.FC<PublicSiteLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { editMode, exitEditMode } = useSafeLiveEditor();

  const navItems = [
    { label: "Início", href: "/" },
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Biblioteca", href: "/biblioteca" },
    { label: "Células", href: "/celulas" },
    { label: "Agenda", href: "/agenda" },
    { label: "Aconselhamento", href: "/aconselhamento" },
    { label: "Galeria", href: "/galeria" },
    { label: "Semear & Transformar", href: "/semear" },
    { label: "Contato", href: "/contato" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <PublicSiteLogo className="h-16 md:h-20 w-auto shrink-0" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Login Button & Mobile Menu */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {editMode && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={exitEditMode}
                  className="hidden sm:flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Edição
                </Button>
              )}

              {!editMode && (
                <Link to="/auth" className="hidden sm:flex">
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
              
              <button
                type="button"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
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
              <Link to="/auth" className="block">
                <Button className="w-full mt-3" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <PublicSiteLogo className="h-16 md:h-20 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground">
                Uma comunidade de fé, esperança e amor, transformando vidas através das células.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/sobre" className="text-sm text-muted-foreground hover:text-primary">Sobre Nós</Link></li>
                <li><Link to="/celulas" className="text-sm text-muted-foreground hover:text-primary">Células</Link></li>
                <li><Link to="/agenda" className="text-sm text-muted-foreground hover:text-primary">Agenda</Link></li>
                <li><Link to="/galeria" className="text-sm text-muted-foreground hover:text-primary">Galeria</Link></li>
                <li><Link to="/semear" className="text-sm text-muted-foreground hover:text-primary">Semear & Transformar</Link></li>
                <li><Link to="/contato" className="text-sm text-muted-foreground hover:text-primary">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Ministérios</h3>
              <ul className="space-y-2">
                <li><Link to="/primeira-vez" className="text-sm text-muted-foreground hover:text-primary">Primeira Visita</Link></li>
                <li><Link to="/site/ensino" className="text-sm text-muted-foreground hover:text-primary">Ensino</Link></li>
                <li><Link to="/sobre" className="text-sm text-muted-foreground hover:text-primary">Sobre</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contato</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📧 contato@igrejacelulas.com</p>
                <p>📞 (11) 99999-9999</p>
                <p>📍 Rua das Células, 123</p>
                <p>🕐 Domingos: 9h e 19h</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Igreja em Células. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSiteLayout;