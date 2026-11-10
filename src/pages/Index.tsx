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
        <div className="mobile-app-shell min-h-screen flex flex-col justify-between bg-background text-foreground">
          <main className="w-full px-4 py-8 sm:px-6 sm:py-10 md:py-12 flex-grow flex flex-col justify-center items-center">
            <PasswordGenerator headerActions={<ThemeToggle />} />
          </main>
          <ExtensionPromotion />
          <footer className="px-4 py-4 sm:py-6 text-center text-xs text-muted-foreground shrink-0">
            © 2026 CyberKeyGen · Created by{" "}
            <a href="https://karthiklal.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Karthik Lal</a>
          </footer>
        </div>
      )}
    </ThemeProvider>
  );
};

export default Index;
