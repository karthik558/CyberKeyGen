import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  CheckIcon,
  ClipboardCopy,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  Info,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { createMixedPassword } from "@/utils/leetSpeakConverter";
import { generatePronounceablePassword } from "@/utils/pronounceableGenerator";
import { generateSecurePassword, generateSecurePin } from "@/utils/cryptoGenerator";
import PasswordHistory from "./PasswordHistory";
import PasswordFavorites from "./PasswordFavorites";
import PasswordCategories from "./PasswordCategories";
import PasswordStrengthAnalyzer from "./PasswordStrengthAnalyzer";
import PasswordExportImport from "./PasswordExportImport";
import PasswordQRCode from "./PasswordQRCode";
import PasswordExpiryTimer from "./PasswordExpiryTimer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResponsiveGap } from "@/hooks/use-responsive-gap";

interface PasswordSettings {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  requireAllTypes: boolean;
  avoidRepeating: boolean;
  usePronounceable: boolean;
}

interface PinSettings {
  length: number;
  avoidRepeating: boolean;
}

const PasswordGenerator = ({ headerActions }: { headerActions?: React.ReactNode }) => {
  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    requireAllTypes: true,
    avoidRepeating: false,
    usePronounceable: false,
  });

  const [pinSettings, setPinSettings] = useState<PinSettings>({
    length: 6,
    avoidRepeating: false,
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [securityTipsOpen, setSecurityTipsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [baseText, setBaseText] = useState("");
  const [leetPassword, setLeetPassword] = useState("");
  const [activeTab, setActiveTab] = useState("random");
  const [pin, setPin] = useState("");
  const { gap } = useResponsiveGap();
  const isMobile = useIsMobile();

  const [passwordHistory, setPasswordHistory] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>>([]);

  const [passwordFavorites, setPasswordFavorites] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>>([]);

  const [selectedCategory, setSelectedCategory] = useState("");

  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()-_=+";
  const ambiguousChars = "iIl1Lo0O";

  const calculatePasswordStrength = (pwd: string): "weak" | "moderate" | "strong" | "very-strong" => {
    if (!pwd) return "weak";

    const length = pwd.length;
    let typesCount = 0;

    if (/[a-z]/.test(pwd)) typesCount++;
    if (/[A-Z]/.test(pwd)) typesCount++;
    if (/[0-9]/.test(pwd)) typesCount++;
    if (/[^a-zA-Z0-9]/.test(pwd)) typesCount++;

    if (length < 8) return "weak";
    if (length < 12) return typesCount >= 3 ? "moderate" : "weak";
    if (length < 16) return typesCount >= 3 ? "strong" : "moderate";
    return typesCount >= 3 ? "very-strong" : "strong";
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak": return "bg-foreground/35";
      case "moderate": return "bg-foreground/50";
      case "strong": return "bg-foreground/75";
      case "very-strong": return "bg-foreground";
      default: return "bg-zinc-200 dark:bg-zinc-800";
    }
  };

  const applyGeneratedValue = (finalValue: string, callback: (val: string) => void) => {
    callback(finalValue);
    setCopied(false);
    setPasswordHistory(previous => [{
      password: finalValue,
      timestamp: new Date(),
      strength: calculatePasswordStrength(finalValue),
      type: activeTab as "random" | "leet" | "pin",
      category: selectedCategory || "uncategorized",
    }, ...previous.filter(item => item.password !== finalValue)].slice(0, 100));
  };

  const generateRandomPassword = () => {
    try {
      if (
        !settings.usePronounceable &&
        !settings.includeLowercase &&
        !settings.includeUppercase &&
        !settings.includeNumbers &&
        !settings.includeSymbols
      ) {
        toast.error("Please select at least one character type");
        return;
      }

      const result = generateSecurePassword({
        length: settings.length,
        includeLowercase: settings.includeLowercase,
        includeUppercase: settings.includeUppercase,
        includeNumbers: settings.includeNumbers,
        includeSymbols: settings.includeSymbols,
        excludeAmbiguous: settings.excludeAmbiguous,
        avoidRepeating: settings.avoidRepeating,
        requireAllTypes: settings.requireAllTypes,
        usePronounceable: settings.usePronounceable,
      });

      applyGeneratedValue(result, (final) => {
        setPassword(final);
      });
    } catch (error) {
      console.error("Password generation error:", error);
      toast.error("Failed to generate password");
    }
  };

  const generateLeetPassword = () => {
    if (!baseText) {
      toast.error("Please enter some text first");
      return;
    }

    const mixedPassword = createMixedPassword(
      baseText,
      settings.length,
      settings.includeLowercase,
      settings.includeUppercase,
      settings.includeNumbers,
      settings.includeSymbols,
      settings.excludeAmbiguous
    );

    applyGeneratedValue(mixedPassword, (final) => {
      setLeetPassword(final);
    });
  };

  const generatePin = () => {
    try {
      const result = generateSecurePin(pinSettings.length, pinSettings.avoidRepeating);
      applyGeneratedValue(result, (final) => {
        setPin(final);
      });
    } catch (error) {
      console.error("PIN generation error:", error);
      toast.error("Failed to generate PIN");
    }
  };

  const copyToClipboard = () => {
    const textToCopy = activeTab === "random" ? password :
                    activeTab === "leet" ? leetPassword : pin;

    if (!textToCopy) {
      toast.error("Generate a password first!");
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(true);
        toast.success("Password copied to clipboard!");

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      () => {
        toast.error("Failed to copy password");
      }
    );
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    toast.success("Password history cleared");
  };

  const clearFavorites = () => {
    setPasswordFavorites([]);
    toast.success("Favorites cleared");
  };

  const addToFavorites = (passwordItem: {
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }) => {
    if (passwordFavorites.some(item => item.password === passwordItem.password)) {
      toast.info("Password already in favorites");
      return;
    }

    setPasswordFavorites(prev => [
      {
        ...passwordItem,
        category: passwordItem.category || selectedCategory || "uncategorized"
      },
      ...prev
    ]);

    toast.success("Added to favorites");
  };

  const removeFromFavorites = (index: number) => {
    setPasswordFavorites(prev => prev.filter((_, i) => i !== index));
    toast.success("Removed from favorites");
  };

  const handleImportPasswords = (importedPasswords: typeof passwordHistory) => {
    const existingPasswords = new Set(passwordHistory.map(p => p.password));
    const newPasswords = importedPasswords.filter(p => !existingPasswords.has(p.password));

    setPasswordHistory(prev => [
      ...newPasswords,
      ...prev
    ].slice(0, 100));
  };

  const addCurrentPasswordToFavorites = () => {
    const currentPassword = activeTab === "random" ? password :
                           activeTab === "leet" ? leetPassword : pin;

    if (!currentPassword) {
      toast.error("Generate a password first!");
      return;
    }

    addToFavorites({
      password: currentPassword,
      timestamp: new Date(),
      strength: calculatePasswordStrength(currentPassword),
      type: activeTab as "random" | "leet" | "pin",
      category: selectedCategory || "uncategorized"
    });
  };

  const saveToHistory = () => {
    const currentPassword = activeTab === "random" ? password :
                           activeTab === "leet" ? leetPassword : pin;

    if (!currentPassword) {
      toast.error("Generate a password first!");
      return;
    }

    setPasswordHistory(prev => [
      {
        password: currentPassword,
        timestamp: new Date(),
        strength: calculatePasswordStrength(currentPassword),
        type: activeTab as "random" | "leet" | "pin",
        category: selectedCategory || "uncategorized"
      },
      ...prev.filter(item => item.password !== currentPassword).slice(0, 99)
    ]);

    toast.success("Added to history");
  };

  const handlePasswordExpiry = () => {
    if (activeTab === "random") {
      setPassword("");
    } else if (activeTab === "leet") {
      setLeetPassword("");
    } else {
      setPin("");
    }
  };

  const shortcuts = [
    {
      key: "g",
      description: "Generate new password/PIN",
      action: () => {
        if (activeTab === "random") {
          generateRandomPassword();
        } else if (activeTab === "leet") {
          generateLeetPassword();
        } else {
          generatePin();
        }
      }
    },
    {
      key: "c",
      description: "Copy to clipboard",
      action: copyToClipboard
    },
    {
      key: "s",
      description: "Toggle visibility",
      action: () => setShowPassword(!showPassword)
    },
    {
      key: "f",
      description: "Add to favorites",
      action: addCurrentPasswordToFavorites
    },
    {
      key: "h",
      description: "Save to history",
      action: saveToHistory
    },
    {
      key: "1",
      description: "Switch to Random tab",
      action: () => setActiveTab("random")
    },
    {
      key: "2",
      description: "Switch to Text to Password tab",
      action: () => setActiveTab("leet")
    },
    {
      key: "3",
      description: "Switch to PIN Generator tab",
      action: () => setActiveTab("pin")
    }
  ];

  const { isListening, toggleListening } = useKeyboardShortcuts(shortcuts);

  useEffect(() => { setCopied(false); }, [activeTab]);

  const formatConsolePassword = (pwd: string, placeholderText: string) => {
    const displayValue = pwd;

    if (!displayValue) {
      return (
        <span className="text-muted-foreground font-sans text-sm sm:text-base">
          {placeholderText}
        </span>
      );
    }

    if (!showPassword) {
      return (
        <span className="tracking-widest font-mono text-lg sm:text-xl text-primary/80 select-none">
          {"•".repeat(displayValue.length)}
        </span>
      );
    }

    return (
      <span className="font-mono text-lg sm:text-xl break-all">
        {displayValue.split("").map((char, index) => {
          if (/[a-z]/.test(char)) return <span key={index} className="char-lowercase">{char}</span>;
          if (/[A-Z]/.test(char)) return <span key={index} className="char-uppercase">{char}</span>;
          if (/[0-9]/.test(char)) return <span key={index} className="char-number">{char}</span>;
          return <span key={index} className="char-symbol">{char}</span>;
        })}
      </span>
    );
  };

  const currentPassword = activeTab === "random" ? password :
                         activeTab === "leet" ? leetPassword : pin;
  const currentStrength = calculatePasswordStrength(currentPassword);
  const strengthScore = !currentPassword ? 0 : currentStrength === "weak" ? 25 : currentStrength === "moderate" ? 50 : currentStrength === "strong" ? 75 : 100;

  return (
    <div className="generator-shell w-full max-w-7xl mx-auto">
      <Card className="bg-card border border-border rounded-xl relative overflow-hidden">
        <CardHeader className="generator-header border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <img src="/favicon.png" alt="CyberKeyGen" className="w-4 h-4 object-contain dark:invert-0 invert" />
              <span className="generator-eyebrow">CyberKeyGen</span>
            </div>
            {headerActions}
          </div>
          <h1 className="generator-title font-semibold">Strong passwords. Zero fuss.</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Your next password starts here. Create, customize, and copy in seconds.</p>
        </CardHeader>

        <CardContent className="generator-body space-y-6">
          <Tabs
            defaultValue="random"
            className="generator-workspace"
            onValueChange={(value) => setActiveTab(value)}
            value={activeTab}
          >
            <TabsPrimitive.List className="segmented-tabs-list">
              <TabsPrimitive.Trigger
                value="random"
                className="segmented-tab-trigger"
              >
                Random
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger
                value="leet"
                className="segmented-tab-trigger"
              >
                From text
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger
                value="pin"
                className="segmented-tab-trigger"
              >
                PIN
              </TabsPrimitive.Trigger>
            </TabsPrimitive.List>

            <div className="generator-preview">
              <nav className="generator-toolbar" aria-label="Password tools">
                <div className={`flex items-center ${gap}`}>
                  <PasswordHistory
                    history={passwordHistory}
                    onClearHistory={clearHistory}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                    onAddToFavorites={addToFavorites}
                    favorites={passwordFavorites}
                  />
                  <PasswordFavorites
                    favorites={passwordFavorites}
                    onClearFavorites={clearFavorites}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                    onRemoveFromFavorites={removeFromFavorites}
                  />
                  <PasswordStrengthAnalyzer password={currentPassword} />
                </div>
                <div className={`flex items-center ${gap}`}>
                  {!isMobile && (
                    <KeyboardShortcuts
                      shortcuts={shortcuts}
                      isEnabled={isListening}
                      onToggle={toggleListening}
                    />
                  )}
                  <PasswordExportImport
                    passwordHistory={passwordHistory}
                    onImport={handleImportPasswords}
                  />
                </div>
              </nav>

              {activeTab === "leet" && (
                <div className="space-y-2 mb-5">
                  <Label htmlFor="base-text">Your starting word or phrase</Label>
                  <Input id="base-text" placeholder="e.g. a quiet morning" value={baseText}
                    onChange={(event) => setBaseText(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") generateLeetPassword(); }} />
                  <p className="text-xs text-muted-foreground">We’ll mix your text with random characters.</p>
                </div>
              )}
              <div className="premium-display-card">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{activeTab === "pin" ? "Your PIN" : "Your password"}</span>
                  <Button variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={!currentPassword} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="password-value" aria-label="Generated result">
                  {formatConsolePassword(currentPassword, "Ready when you are.")}
                </div>
                <p className="mt-3 text-xs text-muted-foreground" role="status">
                  {currentPassword ? `${currentPassword.length} ${activeTab === "pin" ? "digits" : "characters"} · Generated in your browser` : "Choose your settings, then hit Generate."}
                </p>
              </div>
              <div className="primary-actions">
                <Button onClick={activeTab === "random" ? generateRandomPassword : activeTab === "leet" ? generateLeetPassword : generatePin}
                  disabled={activeTab === "leet" && !baseText.trim()} aria-label={activeTab === "pin" ? "Generate PIN" : "Generate password"}>
                  <RefreshCw className="h-4 w-4" /> Generate{currentPassword ? " again" : ""}
                </Button>
                <Button variant="outline" onClick={copyToClipboard} disabled={!currentPassword}>
                  {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="generator-actions">
                <div>
                  <PasswordCategories onSelectCategory={setSelectedCategory} selectedCategory={selectedCategory} />
                  <PasswordQRCode password={currentPassword} />
                  <PasswordExpiryTimer key={`${activeTab}-${currentPassword}`} password={currentPassword} onPasswordExpiry={handlePasswordExpiry} />
                </div>
                <Button variant="ghost" disabled={!currentPassword} onClick={addCurrentPasswordToFavorites}>
                  <Heart className="h-4 w-4" /> Save
                </Button>
              </div>
              <div className="generator-strength">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className={`capitalize font-bold ${
                    !currentPassword ? "text-muted-foreground" :
                    currentStrength === "weak" ? "text-foreground" :
                    currentStrength === "moderate" ? "text-foreground" :
                    "text-foreground"
                  }`}>
                    {currentPassword ? currentStrength.replace("-", " ") : "Not rated"}
                  </span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border" role="progressbar" aria-label="Password strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strengthScore} aria-valuetext={currentPassword ? currentStrength.replace("-", " ") : "Not rated"}>
                  <div
                    className={`h-full rounded-full transition-[width,background-color] duration-300 ${getPasswordStrengthColor(currentStrength)}`}
                    style={{ width: `${strengthScore}%` }}
                  ></div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">History and saved passwords stay in this tab and clear when you reload.</p>
            </div>

            <Collapsible className="generator-customize" open={!isMobile || customizeOpen} onOpenChange={setCustomizeOpen}>
              <div className="hidden md:block mb-4">
                <h2 className="text-base font-semibold">Customize {activeTab === "pin" ? "PIN" : "password"}</h2>
                <p className="text-xs text-muted-foreground mt-1">Set your preferences, then generate.</p>
              </div>
              <CollapsibleTrigger asChild className="md:hidden">
                <Button variant="ghost" className="customize-trigger">
                  <span>Customize {activeTab === "pin" ? "PIN" : "password"}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${customizeOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="customize-content">
            <TabsContent value="random" className="space-y-4 mt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password-length" className="text-xs font-medium">Password Length</Label>
                  <span className="font-mono text-xs">{settings.length}</span>
                </div>
                <Slider
                  id="password-length"
                  min={8}
                  max={128}
                  step={1}
                  value={[settings.length]}
                  onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                  className="py-2"
                  aria-label="Password length"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" aria-label="Quick password lengths">
                {[12, 16, 24, 32, 48, 64].map(length => (
                  <Button key={length} variant={settings.length === length ? "default" : "outline"} size="sm"
                    aria-pressed={settings.length === length} onClick={() => setSettings({ ...settings, length })}>
                    {length} <span className="sr-only">characters</span>
                  </Button>
                ))}
              </div>
              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Character Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="lowercase" className="text-xs">Lowercase (a-z)</Label>
                    <Switch
                      id="lowercase"
                      checked={settings.includeLowercase}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeLowercase: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="uppercase" className="text-xs">Uppercase (A-Z)</Label>
                    <Switch
                      id="uppercase"
                      checked={settings.includeUppercase}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeUppercase: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="numbers" className="text-xs">Numbers (0-9)</Label>
                    <Switch
                      id="numbers"
                      checked={settings.includeNumbers}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeNumbers: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="symbols" className="text-xs">Symbols (!@#$%^&*)</Label>
                    <Switch
                      id="symbols"
                      checked={settings.includeSymbols}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeSymbols: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ambiguous" className="text-xs">Exclude Ambiguous (iIl1Lo0O)</Label>
                    <Switch
                      id="ambiguous"
                      checked={settings.excludeAmbiguous}
                      onCheckedChange={(checked) => setSettings({ ...settings, excludeAmbiguous: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="pronounceable" className="text-xs">Pronounceable Password</Label>
                    <Switch
                      id="pronounceable"
                      checked={settings.usePronounceable}
                      onCheckedChange={(checked) => setSettings({ ...settings, usePronounceable: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Advanced Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="all-types" className="text-xs">Require All Selected Types</Label>
                    <Switch
                      id="all-types"
                      checked={settings.requireAllTypes}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireAllTypes: checked })}
                      disabled={settings.usePronounceable}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="avoid-repeating" className="text-xs">Avoid Repeating Characters</Label>
                    <Switch
                      id="avoid-repeating"
                      checked={settings.avoidRepeating}
                      onCheckedChange={(checked) => setSettings({ ...settings, avoidRepeating: checked })}
                      disabled={settings.usePronounceable}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leet" className="space-y-4 mt-0">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  A familiar phrase makes a memorable starting point. Random passwords are a better choice for sensitive accounts.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="leet-password-length" className="text-xs font-medium">Password Length</Label>
                    <span className="font-mono text-xs">{settings.length}</span>
                  </div>
                  <Slider
                    id="leet-password-length"
                    aria-label="Text password length"
                    min={8}
                    max={128}
                    step={1}
                    value={[settings.length]}
                    onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                    className="py-2"
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Character Types (for random part)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-lowercase" className="text-xs">Lowercase (a-z)</Label>
                      <Switch
                        id="leet-lowercase"
                        checked={settings.includeLowercase}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeLowercase: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-uppercase" className="text-xs">Uppercase (A-Z)</Label>
                      <Switch
                        id="leet-uppercase"
                        checked={settings.includeUppercase}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeUppercase: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-numbers" className="text-xs">Numbers (0-9)</Label>
                      <Switch
                        id="leet-numbers"
                        checked={settings.includeNumbers}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeNumbers: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-symbols" className="text-xs">Symbols (!@#$%^&*)</Label>
                      <Switch
                        id="leet-symbols"
                        checked={settings.includeSymbols}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeSymbols: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-ambiguous" className="text-xs">Exclude Ambiguous (iIl1Lo0O)</Label>
                      <Switch
                        id="leet-ambiguous"
                        checked={settings.excludeAmbiguous}
                        onCheckedChange={(checked) => setSettings({ ...settings, excludeAmbiguous: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pin" className="space-y-4 mt-0">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Generate a secure PIN code with your desired length. Great for device unlock codes, ATM PINs, and other numeric access needs.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="pin-length" className="text-xs font-medium">PIN Length</Label>
                    <span className="font-mono text-xs">{pinSettings.length}</span>
                  </div>
                  <Slider
                    id="pin-length"
                    aria-label="PIN length"
                    min={4}
                    max={12}
                    step={1}
                    value={[pinSettings.length]}
                    onValueChange={(value) => setPinSettings({ ...pinSettings, length: value[0] })}
                    className="py-2"
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">PIN Options</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="avoid-repeating-pin" className="text-xs">Avoid Repeating Digits</Label>
                      <Switch
                        id="avoid-repeating-pin"
                        checked={pinSettings.avoidRepeating}
                        onCheckedChange={(checked) => setPinSettings({ ...pinSettings, avoidRepeating: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
              </CollapsibleContent>
            </Collapsible>
          </Tabs>

          <Separator />

          <Collapsible
            open={securityTipsOpen}
            onOpenChange={setSecurityTipsOpen}
            className="security-tips space-y-2 bg-secondary/10 hover:bg-secondary/20 transition-colors border border-border/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm text-foreground/90">Password security tips</h3>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full hover:bg-secondary/40">
                  <span className="sr-only">Toggle</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${securityTipsOpen ? "rotate-180 text-primary" : ""}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2 pt-3 border-t border-border/10 mt-2">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground/90 font-sans list-none">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use at least 12 characters for strong security</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Combine uppercase, lowercase, numbers, and symbols</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Avoid using personal information</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use unique passwords for each account</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Consider using a password manager</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Pronounceable passwords can be easier to remember but may be less secure</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use keyboard shortcuts to quickly generate passwords</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Set expiry timers for temporary passwords</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> For PINs, avoid common sequences like 1234 or 0000</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Longer PINs (8+ digits) provide much better security</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
