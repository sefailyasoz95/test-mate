import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface Profile {
  email: string;
  full_name: string | null;
}

interface User {
  id: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getProfile(userId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      setProfile({
        email: data?.email || session?.user?.email || "",
        full_name: data?.full_name,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    profile,
    isLoading,
    signOut: () => supabase.auth.signOut(),
  };
}
