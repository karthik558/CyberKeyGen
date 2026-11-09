
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  X,
  ClipboardCopy,
  History,
  Trash2,
  Eye,
  EyeOff,
  Heart,
  CheckIcon,
  Tag
} from "lucide-react";
import { toast } from "sonner";

interface PasswordHistoryProps {
  history: Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>;
  onClearHistory: () => void;
  onCopyPassword: (password: string) => void;
  onAddToFavorites: (password: {
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }) => void;
  favorites: Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>;
}

const PasswordHistory: React.FC<PasswordHistoryProps> = ({
  history,
  onClearHistory,
  onCopyPassword,
  onAddToFavorites,
  favorites
}) => {
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (password: string, index: number) => {
    onCopyPassword(password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isInFavorites = (password: string) => {
    return favorites.some(fav => fav.password === password);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak": return "bg-foreground/35";
      case "moderate": return "bg-foreground/50";
      case "strong": return "bg-foreground/75";
      case "very-strong": return "bg-foreground";
      default: return "bg-zinc-200 dark:bg-zinc-800";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative" aria-label="Open password history">
          <History className="h-4 w-4" />
          <span>History</span>
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold px-1 animate-pulse">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="password-library text-foreground" showCloseButton={false}>
        <SheetHeader className="mb-4 border-b border-border/20 pb-3">
          <div className="library-heading">
            <SheetTitle>Password history</SheetTitle>
            <div className="library-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {history.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onClearHistory}
                  aria-label="Clear password history"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <SheetClose asChild>
                <Button variant="outline" size="icon" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </div>
          <SheetDescription className="text-left text-xs">Kept in this tab only. Reloading clears this list.</SheetDescription>
        </SheetHeader>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 font-mono text-xs text-muted-foreground">
            <History className="mb-4 h-8 w-8" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Your history starts here</p>
            <p className="mt-2 text-center font-sans">Generated passwords will appear in this list.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {history.map((item, index) => (
              <div
                key={index}
                className="p-3 border border-border/20 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-all duration-300 relative group shadow-sm"
              >
                <div className="flex justify-between items-center mb-1.5 font-mono">
                  <span className="text-[10px] opacity-60">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.category && item.category !== "uncategorized" && (
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center">
                        <Tag className="h-2.5 w-2.5 mr-1" />
                        {item.category}
                      </span>
                    )}
                    <span className="text-[10px] capitalize bg-secondary/60 border border-border/20 px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label={`${item.strength.replace("-", " ")} password strength`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.strength === "weak" ? 25 : item.strength === "moderate" ? 50 : item.strength === "strong" ? 75 : 100}>
                  <div className={`h-full ${getStrengthColor(item.strength)}`} style={{ width: item.strength === "weak" ? "25%" : item.strength === "moderate" ? "50%" : item.strength === "strong" ? "75%" : "100%" }} />
                </div>
                <div className="font-mono bg-secondary border border-border/80 rounded-lg p-2.5 mb-2 overflow-x-auto select-all">
                  {showPasswords ? (
                    <code className="text-xs break-all text-foreground">{item.password}</code>
                  ) : (
                    <code className="text-xs tracking-widest text-muted-foreground/60 select-none">••••••••••••••••</code>
                  )}
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/10">
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden border border-border/20 p-0">
                      <div
                        className={`h-full ${getStrengthColor(item.strength)}`}
                        style={{
                          width:
                            item.strength === "weak"
                              ? "25%"
                              : item.strength === "moderate"
                              ? "50%"
                              : item.strength === "strong"
                              ? "75%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono capitalize">{item.strength.replace("-", " ")}</span>
                  </div>
                   <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddToFavorites(item)}
                      aria-label="Save password to favorites"
                      className={`h-7 px-2 hover:bg-secondary/40 ${isInFavorites(item.password) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      disabled={isInFavorites(item.password)}
                    >
                      <Heart className="h-3.5 w-3.5" fill={isInFavorites(item.password) ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(item.password, index)}
                      aria-label="Copy password"
                      className="h-7 px-2 hover:bg-secondary/40"
                    >
                      {copiedIndex === index ? (
                        <CheckIcon className="h-3.5 w-3.5 text-foreground" />
                      ) : (
                        <ClipboardCopy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PasswordHistory;
