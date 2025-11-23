import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// [c-m] Removed BrowserRouter from this import
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CursorFollower } from "@/components/CursorFollower";
import ParticlesBackground from "@/components/ParticlesBackground";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Quiz from "./pages/Quiz";
import Loading from "./pages/Loading";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PublicResult from "./pages/PublicResult";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CursorFollower />
      <ParticlesBackground />
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:shareId" element={<PublicResult />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;