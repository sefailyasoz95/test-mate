import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client with cookie handling
export const createClient = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    cookies: {
      get(name: string) {
        if (typeof document === "undefined") return "";
        return document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${name}=`))
          ?.split("=")[1];
      },
      set(name: string, value: string, options: CookieOptions) {
        if (typeof document === "undefined") return;
        document.cookie = `${name}=${value}; path=/; max-age=${
          options.maxAge ?? 0
        }`;
      },
      remove(name: string, options: CookieOptions) {
        if (typeof document === "undefined") return;
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      },
    },
  }
);

// Server client for server components/api routes
export const createServer = async (context: { cookies: any }) => {
  const cookieStore = await context.cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          console.warn("Cookie cannot be set:", error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: -1 });
        } catch (error) {
          console.warn("Cookie cannot be removed:", error);
        }
      },
    },
  });
};

// Middleware client
export const createMiddleware = async (context: { cookies: any }) => {
  const cookieStore = context.cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          console.warn("Cookie cannot be set:", error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: -1 });
        } catch (error) {
          console.warn("Cookie cannot be removed:", error);
        }
      },
    },
  });
};

// Export a pre-configured browser client instance
export const supabase = createClient;
