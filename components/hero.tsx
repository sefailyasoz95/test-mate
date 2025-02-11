"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Stars, CheckCircle } from "lucide-react";
import {
  FaGooglePlay,
  FaAndroid,
  FaPlayCircle,
  FaGoogle,
} from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";

const Hero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial style before hydration
  const headingStyle = mounted
    ? {
        WebkitTextStroke: theme === "dark" ? "1px #1d4ed855" : "1px #3b82f655",
      }
    : {};

  const handleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("SignIn Error:", error.message);
        throw error;
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background py-32">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-[100px] dark:from-blue-500/10 dark:to-purple-500/10" />
        </div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Google Play Icon */}
        <FaGooglePlay className="absolute top-1/4 left-10 w-24 h-24 text-primary/20 dark:text-primary/10 animate-blob" />

        {/* Android Icon */}
        <FaAndroid className="absolute top-1/3 right-10 w-32 h-32 text-green-500/20 dark:text-green-500/10 animate-blob animation-delay-2000" />

        {/* Another Play Icon */}
        <FaPlayCircle className="absolute bottom-1/4 left-1/3 w-20 h-20 text-purple-500/20 dark:text-purple-500/10 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center animate-fadeIn">
          <div className="animate-scaleUp">
            <h1
              className={`text-6xl text-transparent bg-clip-text
              bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 from-blue-700 to-purple-700 tracking-wider
              animate-fillText bg-no-repeat bg-[length:0%_100%]`}
              style={headingStyle}
            >
              Skip the Tester Hunt, Launch Faster
            </h1>
          </div>

          <p className="mt-6 text-lg leading-8 text-muted-foreground animate-slideDown">
            Meet Google Play's 12-tester requirement instantly with our
            pre-verified tester accounts - launch your app faster without the
            hassle.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6 animate-scaleUp">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 dark:border-slate-700 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] dark:bg-[linear-gradient(110deg,#1e2631,45%,#2d3643,55%,#1e2631)] bg-[length:200%_100%] px-6 font-medium text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10 transform transition-transform group-hover:translate-x-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    Welcome
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Sign in to access your tester dashboard
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 w-full hover:bg-accent"
                    onClick={handleSignIn}
                  >
                    <FaGoogle className="h-5 w-5" />
                    Continue with Google
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Instant Access",
                description: "Get 12 testers immediately",
                color: "blue",
              },
              {
                icon: Stars,
                title: "Premium Testing",
                description: "Active testing & feedback",
                color: "purple",
              },
              {
                icon: CheckCircle,
                title: "Google Verified",
                description: "Meet Play Store requirements",
                color: "green",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center transform hover:scale-105 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div
                  className={`rounded-full bg-${feature.color}-100 p-3 dark:bg-${feature.color}-900 transform transition-transform hover:scale-110`}
                >
                  <feature.icon
                    className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
