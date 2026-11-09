import React, { useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityIcon, CheckIcon, XIcon } from "lucide-react";

interface PasswordStrengthAnalyzerProps {
  password: string;
}

const PasswordStrengthAnalyzer: React.FC<PasswordStrengthAnalyzerProps> = ({ password }) => {
  const checklistHeadingId = useId();
  
  const getPasswordStrength = () => {
    if (!password) return "weak";
    
    const length = password.length;
    let typesCount = 0;
    
    if (/[a-z]/.test(password)) typesCount++;
    if (/[A-Z]/.test(password)) typesCount++;
    if (/[0-9]/.test(password)) typesCount++;
    if (/[^a-zA-Z0-9]/.test(password)) typesCount++;
    
    if (length < 8) return "weak";
    if (length < 12) return typesCount >= 3 ? "moderate" : "weak";
    if (length < 16) return typesCount >= 3 ? "strong" : "moderate";
    return typesCount >= 3 ? "very-strong" : "strong";
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "weak": return "bg-foreground/35";
      case "moderate": return "bg-foreground/50";
      case "strong": return "bg-foreground/75";
      case "very-strong": return "bg-foreground";
      default: return "bg-zinc-300";
    }
  };

  const getPasswordStrengthTextColor = () => {
    switch (getPasswordStrength()) {
      case "weak": return "text-foreground";
      case "moderate": return "text-foreground";
      case "strong": return "text-foreground";
      case "very-strong": return "text-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getPasswordScore = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "weak": return 25;
      case "moderate": return 50;
      case "strong": return 75;
      case "very-strong": return 100;
      default: return 0;
    }
  };

  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasNoRepeatingChars = !/(.)\1\1/.test(password);
  const hasNoCommonPatterns = !/^(?:123456|password|qwerty)/i.test(password);
  
  const getTimeToCrack = () => {
    if (!password) return "Instantly";
    
    const charsetSize = 
      (hasLowercase ? 26 : 0) + 
      (hasUppercase ? 26 : 0) + 
      (hasNumber ? 10 : 0) + 
      (hasSymbol ? 33 : 0);
    
    const combinations = Math.pow(charsetSize, password.length);
    const attemptsPerSecond = 1000000000;
    const seconds = combinations / attemptsPerSecond;
    
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`;
    
    return "Centuries";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-border/60">
          <ActivityIcon className="h-4 w-4" />
          <span>Analyze</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <ActivityIcon className="h-5 w-5" />
            Strength analysis
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/85 text-xs">
            A quick local check of your password’s structure.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {password ? (
            <>
              <div className="space-y-4 rounded-xl border bg-secondary p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall rating</p>
                    <p className={`mt-1 text-2xl font-semibold capitalize ${getPasswordStrengthTextColor()}`}>
                    {getPasswordStrength().replace("-", " ")}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">{getPasswordScore() / 25} / 4</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border bg-background" role="progressbar" aria-label="Password strength" aria-valuenow={getPasswordScore()} aria-valuemin={0} aria-valuemax={100}>
                  <div 
                    className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ width: `${getPasswordScore()}%` }}
                  ></div>
                </div>
                <p className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Estimated crack time</span>
                  <span className="font-medium text-foreground">{getTimeToCrack()}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 id={checklistHeadingId} className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Security checklist</h4>
                <div className="grid gap-2 [&>div]:min-h-11 [&>div]:rounded-lg [&>div]:border [&>div]:p-3 [&_svg]:shrink-0" role="list" aria-labelledby={checklistHeadingId}>
                  <div className="flex items-center" role="listitem">
                    {hasMinLength ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">At least 12 characters</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {hasLowercase ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains lowercase letters</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {hasUppercase ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains uppercase letters</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {hasNumber ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains numbers</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {hasSymbol ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains symbols</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {hasNoRepeatingChars ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">No character repeated three times in a row</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {hasNoCommonPatterns ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Does not start with 123456, password, or qwerty</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground leading-relaxed rounded-lg border p-4">
                <p>
                  This is a local estimate, not a security guarantee. Crack time assumes random characters and one billion guesses per second; predictable words and patterns can be guessed much faster. This does not check for breached passwords.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Generate a password first to see its strength and checklist here.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordStrengthAnalyzer;
