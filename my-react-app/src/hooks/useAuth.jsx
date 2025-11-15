import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const mountedRef = useRef(true);

  const checkAdminStatus = async (userId) => {
    if (!userId || !mountedRef.current) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (!mountedRef.current) return;

      if (!error && data) {
        setIsAdmin(data);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      if (mountedRef.current) {
        setIsAdmin(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session immediately - this is critical for page refreshes
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Error getting initial session:", error);
          setLoading(false);
          return;
        }

        console.log("Initial session loaded:", initialSession?.user?.email || "No user");
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await checkAdminStatus(initialSession.user.id);
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Load initial session first
    initializeAuth();

    // Then set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log("Auth state change:", event, newSession?.user?.email || "No user");
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await checkAdminStatus(newSession.user.id);
        } else {
          setIsAdmin(false);
        }

        // Set loading to false after processing auth state change
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Clear state first to prevent race conditions
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage items related to auth
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return { user, session, loading, isAdmin, signOut };
};