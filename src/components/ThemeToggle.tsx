
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect } from "react";

interface ThemeToggleProps {
  onThemeChange?: (isDarkMode: boolean) => void;
}

export function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(resolvedTheme === "dark");
    }
  }, [resolvedTheme, onThemeChange]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
