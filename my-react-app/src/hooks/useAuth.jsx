import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const initialLoadCompleteRef = useRef(false);

  const checkAdminStatus = async (userId) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _role: "admin",
        _user_id: userId,
      });

      if (!error && data) {
        setIsAdmin(data);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await checkAdminStatus(initialSession.user.id);
        } else {
          setIsAdmin(false);
        }
        
        initialLoadCompleteRef.current = true;
        setLoading(false);
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        // Skip the initial session event since we already handled it
        if (event === 'INITIAL_SESSION') {
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await checkAdminStatus(newSession.user.id);
        } else {
          setIsAdmin(false);
        }

        // Set loading to false after processing auth state change
        // Always set it for sign in/out events, or if initial load is complete
        if (initialLoadCompleteRef.current || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state (auth state change will also handle this, but we do it immediately)
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return { user, session, loading, isAdmin, signOut };
};
