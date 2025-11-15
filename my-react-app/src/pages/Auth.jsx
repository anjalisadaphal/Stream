// [REPLACE] src/pages/Auth.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // This will now correctly redirect if the hook loads and finds a user.
    if (!authLoading && user) {
      console.log("User is logged in, redirecting to home. User email:", user.email);
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      const needsEmailConfirmation = !data.session;
      
      toast({
        title: "Success!",
        description: needsEmailConfirmation 
          ? "Account created! Please check your email to confirm your account before signing in."
          : "Account created successfully. You can now sign in.",
      });
      
      if (data.session) {
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        setFullName("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting sign in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      if (!data?.session) {
        console.error("No session in response");
        throw new Error("Sign in successful but no session was created. Please try again.");
      }

      console.log("Sign in successful, user:", data.session.user?.email);
      console.log("Session token exists:", !!data.session.access_token);

      // Verify session is persisted
      const { data: { session: verifiedSession } } = await supabase.auth.getSession();
      if (!verifiedSession) {
        throw new Error("Session was not properly saved. Please try again.");
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      setEmail("");
      setPassword("");
      
      // Wait a moment for auth state to update, then navigate
      // The useEffect will handle navigation when user state updates
      setTimeout(() => {
        if (verifiedSession?.user) {
          navigate("/", { replace: true });
        }
      }, 100);
      
    } catch (error) {
      console.error("Sign in error:", error);
      let errorMessage = "Invalid email or password. Please check your credentials and try again.";
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed") || error.message.includes("not confirmed")) {
          errorMessage = "Please verify your email address before signing in. Check your inbox for a confirmation email.";
        } else if (error.message.includes("User not found")) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many sign-in attempts. Please wait a moment and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show a spinner while the auth hook is loading.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If auth is done and NO user, show the form.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
            STREAM
          </CardTitle>
          <CardDescription className="text-center text-base">
            Smart Career Guidance System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;