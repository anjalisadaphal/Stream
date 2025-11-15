import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold">404</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
          <div className="pt-4">
            <Button onClick={() => navigate("/")} size="lg">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;