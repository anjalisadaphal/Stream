import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, User, Home, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            STREAM
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
              activeClassName="text-primary bg-primary/10"
            >
              <Home className="h-4 w-4 inline mr-2" />
              Home
            </NavLink>
            
            {user && (
              <NavLink
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
                activeClassName="text-primary bg-primary/10"
              >
                <LayoutDashboard className="h-4 w-4 inline mr-2" />
                Dashboard
              </NavLink>
            )}
            
            {isAdmin && (
              <NavLink
                to="/admin"
                className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
                activeClassName="text-primary bg-primary/10"
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Admin
              </NavLink>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {authLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <NavLink
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/10 rounded-md"
              activeClassName="text-primary bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Home
            </NavLink>
            
            {user && (
              <>
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/10 rounded-md"
                  activeClassName="text-primary bg-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </NavLink>
                
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/10 rounded-md"
                    activeClassName="text-primary bg-primary/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </NavLink>
                )}
                
                <div className="px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground border-t mt-2 pt-4">
                  <User className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start ml-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
            
            {!user && (
              <Button
                size="sm"
                onClick={() => {
                  navigate("/auth");
                  setMobileMenuOpen(false);
                }}
                className="w-full ml-4 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
