"use client";
import { useEffect, useState } from "react";

/**
 * useIsMobile - Returns true if the screen width is less than 768px (Tailwind's md breakpoint).
 * - SSR safe: always returns false on the server.
 * - Updates responsively on the client.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
