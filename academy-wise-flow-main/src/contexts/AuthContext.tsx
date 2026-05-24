import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Role = "admin" | "teacher" | "student";

interface AuthUser {
  role: Role;
  id: string;
  name: string;
  authId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, role: Role, name: string) => Promise<string | null>;
  logout: () => void;
}

const AUTH_TIMEOUT_MS = 3000;
const AUTH_QUERY_TIMEOUT_MS = 2500;

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

async function withTimeout<T>(promise: PromiseLike<T>, label: string, timeoutMs = AUTH_QUERY_TIMEOUT_MS): Promise<T> {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
  });

  try {
    return await Promise.race<T>([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

async function fetchUserRole(userId: string): Promise<Role | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.rpc("get_user_role", { _user_id: userId }),
      "fetchUserRole"
    );
    if (error) {
      console.error("[auth] fetchUserRole error:", error);
      return null;
    }
    return (data as Role | null) ?? null;
  } catch (e) {
    console.error("[auth] fetchUserRole exception:", e);
    return null;
  }
}

async function fetchProfile(userId: string): Promise<{ name: string } | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
      "fetchProfile"
    );
    if (error) {
      console.error("[auth] fetchProfile error:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("[auth] fetchProfile exception:", e);
    return null;
  }
}

async function ensureUserRole(userId: string): Promise<Role | null> {
  const existingRole = await fetchUserRole(userId);
  if (existingRole) return existingRole;

  console.warn("[auth] Missing role, attempting safe default role assignment", { userId });
  try {
    const { error } = await withTimeout(
      supabase.from("user_roles").insert({ user_id: userId, role: "student" }),
      "assignDefaultStudentRole"
    );

    if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
      console.error("[auth] Failed to assign default role:", error);
      return null;
    }
  } catch (e) {
    console.error("[auth] assignDefaultStudentRole exception:", e);
    return null;
  }

  return fetchUserRole(userId);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAuthUser = async (authUser: User): Promise<AuthUser | null> => {
    try {
      const [role, profile] = await Promise.all([
        ensureUserRole(authUser.id),
        fetchProfile(authUser.id),
      ]);

      if (!role) {
        console.warn("[auth] Unable to resolve user role", { userId: authUser.id });
        return null;
      }

      return {
        role,
        id: authUser.id,
        name: profile?.name || authUser.email || "",
        authId: authUser.id,
      };
    } catch (e) {
      console.error("[auth] buildAuthUser exception:", e);
      return null;
    }
  };

  useEffect(() => {
    let resolved = false;
    let mounted = true;

    const resolve = (reason: string) => {
      if (!resolved && mounted) {
        resolved = true;
        console.info("[auth] loading resolved", { reason });
        setLoading(false);
      }
    };

    const resolveSession = async (session: Session | null, source: string) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        resolve(`${source}:no-session`);
        return;
      }

      try {
        console.info("[auth] resolving authenticated user", { source, userId: session.user.id });
        const authUser = await withTimeout(buildAuthUser(session.user), `buildAuthUser:${source}`);
        if (mounted) setUser(authUser);
      } catch (e) {
        console.error("[auth] resolveSession exception:", e);
        if (mounted) setUser(null);
      } finally {
        resolve(`${source}:done`);
      }
    };

    const timeout = window.setTimeout(() => {
      console.warn("[auth] hard timeout reached while resolving session");
      resolve("hard-timeout");
    }, AUTH_TIMEOUT_MS);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.info("[auth] onAuthStateChange", { event, hasSession: !!session?.user });
      void resolveSession(session, `event:${event}`);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => resolveSession(session, "getSession"))
      .catch((e) => {
        console.error("[auth] getSession error:", e);
        if (mounted) setUser(null);
        resolve("getSession:error");
      });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        "signInWithPassword",
        10000
      );
      if (error) return error.message;
      return null;
    } catch (e) {
      console.error("[auth] login error:", e);
      return "Unable to sign in right now. Please try again.";
    }
  };

  const signup = async (email: string, password: string, role: Role, name: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return error.message;
      if (!data.user) return "Signup failed";

      // Only allow student role self-assignment; admin/teacher handled server-side
      if (role === "student") {
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: role,
        });
        if (roleError) {
          console.error("Role assignment error:", roleError);
          return "Failed to assign role. Please contact admin.";
        }
      }

      return null;
    } catch (e) {
      console.error("[auth] signup error:", e);
      return "Unable to register right now. Please try again.";
    }
  };

  const logout = async () => {
    try {
      await withTimeout(supabase.auth.signOut(), "signOut", 5000);
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
};
