"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useRouter, usePathname } from "next/navigation";
import { useIsAuthenticated } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router, pathname]);

  // Don't render until client has mounted (avoids hydration mismatch from localStorage reads)
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f4f4f9]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
