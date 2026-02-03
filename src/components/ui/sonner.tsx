"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
import { useEffect, useState } from "react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = mounted && theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group !z-[9999]"
      toastOptions={{
        style: {
          zIndex: 9999,
        },
        classNames: {
          toast: "!bg-background !text-foreground !border-border !shadow-lg",
          success: "!bg-green-50 dark:!bg-green-950 !text-green-900 dark:!text-green-100 !border-green-200 dark:!border-green-800",
          error: "!bg-red-50 dark:!bg-red-950 !text-red-900 dark:!text-red-100 !border-red-200 dark:!border-red-800",
          warning: "!bg-yellow-50 dark:!bg-yellow-950 !text-yellow-900 dark:!text-yellow-100 !border-yellow-200 dark:!border-yellow-800",
          info: "!bg-blue-50 dark:!bg-blue-950 !text-blue-900 dark:!text-blue-100 !border-blue-200 dark:!border-blue-800",
          closeButton: "!bg-transparent hover:!bg-black/10 dark:hover:!bg-white/10",
        },
      }}
      style={
        {
          zIndex: 9999,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
