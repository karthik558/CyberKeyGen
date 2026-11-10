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

// Check for 3+ consecutive characters along keyboard walks or alphabet
function hasSequentialOrKeyboardWalk(pwd: string): boolean {
  if (pwd.length < 3) return false;
  const lower = pwd.toLowerCase();
  
  const walks = [
    "abcdefghijklmnopqrstuvwxyz",
    "01234567890",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm"
  ];

  for (const walk of walks) {
    const revWalk = walk.split("").reverse().join("");
    for (let i = 0; i <= walk.length - 3; i++) {
      const fwd = walk.slice(i, i + 3);
      const rev = revWalk.slice(i, i + 3);
      if (lower.includes(fwd) || lower.includes(rev)) {
        return true;
      }
    }
  }
  return false;
}

// Check for repeating cycles like Aa1!Aa1! or abcabc
function hasRepeatingCycles(pwd: string): boolean {
  if (pwd.length < 4) return false;
  for (let len = 2; len <= Math.floor(pwd.length / 2); len++) {
    for (let i = 0; i <= pwd.length - 2 * len; i++) {
      const chunk = pwd.slice(i, i + len);
      if (pwd.slice(i + len, i + 2 * len) === chunk) {
        return true;
      }
    }
  }
  return false;
}

// Common dictionary or predictable tokens
const COMMON_TOKENS = [
  "password", "qwerty", "123456", "admin", "letmein", "welcome",
  "iloveyou", "monkey", "dragon", "master", "sunshine", "football"
];

function hasCommonDictionaryPatterns(pwd: string): boolean {
  const lower = pwd.toLowerCase();
  return COMMON_TOKENS.some(token => lower.includes(token));
}

function analyzePasswordStrength(password: string) {
  if (!password) {
    return {
      entropyBits: 0,
      strength: "weak" as const,
      score: 0,
      timeToCrack: "Instantly",
      hasMinLength: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
      hasNoRepeatingChars: true,
      hasNoRepeatingCycles: true,
      hasNoSequentialOrWalk: true,
      hasNoCommonPatterns: true,
    };
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasMinLength = password.length >= 12;

  const hasNoRepeatingChars = !/(.)\1{2,}/.test(password);
  const hasNoRepeatingCycles = !hasRepeatingCycles(password);
  const hasNoSequentialOrWalk = !hasSequentialOrKeyboardWalk(password);
  const hasNoCommonPatterns = !hasCommonDictionaryPatterns(password);

  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;
  if (poolSize === 0) poolSize = 26;

  // Theoretical Shannon entropy: L * log2(poolSize)
  const rawEntropy = password.length * (Math.log(poolSize) / Math.LN2);

  // Pattern penalties
  let penalty = 0;
  if (!hasNoRepeatingChars) penalty += 8;
  if (!hasNoRepeatingCycles) penalty += 18;
  if (!hasNoSequentialOrWalk) penalty += 12;
  if (!hasNoCommonPatterns) penalty += 20;

  // Repetition frequency deduction
  const uniqueCount = new Set(password).size;
  if (uniqueCount < password.length * 0.5) {
    penalty += Math.round((password.length - uniqueCount) * 1.5);
  }

  const entropyBits = Math.max(1, Math.round(rawEntropy - penalty));

  // Determine strength
  let strength: "weak" | "moderate" | "strong" | "very-strong";
  let score: number;
  if (entropyBits < 38 || password.length < 8) {
    strength = "weak";
    score = 25;
  } else if (entropyBits < 60 || password.length < 12) {
    strength = "moderate";
    score = 50;
  } else if (entropyBits < 80 || password.length < 16) {
    strength = "strong";
    score = 75;
  } else {
    strength = "very-strong";
    score = 100;
  }

  // Crack time assuming 10 billion guesses/sec (modern GPU hashcat cluster)
  const guesses = Math.pow(2, Math.min(120, entropyBits));
  const attemptsPerSecond = 1e10;
  const seconds = guesses / attemptsPerSecond;

  let timeToCrack = "Instantly";
  if (seconds < 1) timeToCrack = "Instantly";
  else if (seconds < 60) timeToCrack = `${Math.round(seconds)} seconds`;
  else if (seconds < 3600) timeToCrack = `${Math.round(seconds / 60)} minutes`;
  else if (seconds < 86400) timeToCrack = `${Math.round(seconds / 3600)} hours`;
  else if (seconds < 31536000) timeToCrack = `${Math.round(seconds / 86400)} days`;
  else if (seconds < 31536000 * 1000) timeToCrack = `${Math.round(seconds / 31536000)} years`;
  else timeToCrack = "Centuries";

  return {
    entropyBits,
    strength,
    score,
    timeToCrack,
    hasMinLength,
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSymbol,
    hasNoRepeatingChars,
    hasNoRepeatingCycles,
    hasNoSequentialOrWalk,
    hasNoCommonPatterns,
  };
}

const PasswordStrengthAnalyzer: React.FC<PasswordStrengthAnalyzerProps> = ({ password }) => {
  const checklistHeadingId = useId();
  const analysis = analyzePasswordStrength(password);

  const getPasswordStrengthColor = () => {
    switch (analysis.strength) {
      case "weak": return "bg-foreground/35";
      case "moderate": return "bg-foreground/50";
      case "strong": return "bg-foreground/75";
      case "very-strong": return "bg-foreground";
      default: return "bg-zinc-300";
    }
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
            Pattern-aware entropy and structure estimation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {password ? (
            <>
              <div className="space-y-4 rounded-xl border bg-secondary p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall rating</p>
                    <p className="mt-1 text-2xl font-semibold capitalize text-foreground">
                      {analysis.strength.replace("-", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm text-foreground font-medium">~{analysis.entropyBits} bits</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entropy</p>
                  </div>
                </div>
                <div 
                  className="h-3 w-full overflow-hidden rounded-full border bg-background" 
                  role="progressbar" 
                  aria-label="Password strength" 
                  aria-valuenow={analysis.score} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${analysis.score}%` }}
                  ></div>
                </div>
                <p className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Est. offline crack time</span>
                  <span className="font-medium text-foreground">{analysis.timeToCrack}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 id={checklistHeadingId} className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Security checklist</h4>
                <div className="grid gap-2 [&>div]:min-h-11 [&>div]:rounded-lg [&>div]:border [&>div]:p-3 [&_svg]:shrink-0" role="list" aria-labelledby={checklistHeadingId}>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasMinLength ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">At least 12 characters</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasLowercase ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains lowercase letters</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasUppercase ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains uppercase letters</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasNumber ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains numbers</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasSymbol ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains symbols</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasNoRepeatingChars && analysis.hasNoRepeatingCycles ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">No repeated characters or cyclical patterns</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasNoSequentialOrWalk ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">No keyboard walks or alphabetical sequences</span>
                  </div>
                  <div className="flex items-center" role="listitem">
                    {analysis.hasNoCommonPatterns ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">No common dictionary words or predictable phrases</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground leading-relaxed rounded-lg border p-4">
                <p>
                  Estimated crack time is a theoretical offline attack estimate assuming dedicated GPU hardware testing 10 billion guesses/second against fast hashes. Predictable phrases, repeated patterns, or reused passwords can be cracked much faster. This check runs entirely locally in your browser and does not check compromised breach databases.
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