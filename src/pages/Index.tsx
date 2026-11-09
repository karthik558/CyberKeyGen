import { useCallback, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import PasswordGenerator from "@/components/PasswordGenerator";
import ExtensionPromotion from "@/components/ExtensionPromotion";
import Preloader from "@/components/Preloader";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const finishLoading = useCallback(() => setIsLoading(false), []);

  return (
    <ThemeProvider defaultTheme="dark">
      {isLoading ? <Preloader onComplete={finishLoading} /> : (
        <div className="mobile-app-shell min-h-screen flex flex-col bg-background text-foreground">
          <main className="w-full px-3 py-5 sm:px-6 sm:py-5 flex-grow">
            <PasswordGenerator headerActions={<ThemeToggle />} />
          </main>
          <ExtensionPromotion />
          <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
            © 2026 CyberKeyGen · Created by{" "}
            <a href="https://karthiklal.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Karthik Lal</a>
          </footer>
        </div>
      )}
    </ThemeProvider>
  );
};

export default Index;
