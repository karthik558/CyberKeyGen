/**
 * EXPERIMENTAL PROTOTYPE - UNLINKED / NOT FOR PRODUCTION USE
 * 
 * This component is an experimental UI wireframe/prototype and is NOT linked into
 * the production CyberKeyGen interface. It does NOT implement RFC 6238 TOTP (HMAC-SHA1/SHA256).
 * Do NOT rely on this component for actual two-factor authentication.
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Shield, Clock3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getSecureRandomInt } from "@/utils/cryptoGenerator";

const TwoFactorGenerator = () => {
  const [code, setCode] = useState("000000");
  const [timeLeft, setTimeLeft] = useState(30);
  const [secretKey, setSecretKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    generateNewCode();
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  const generateNewCode = () => {
    // Note: This is a prototype mockup, not RFC 6238 TOTP
    const randomDigits = getSecureRandomInt(100000, 999999).toString();
    setCode(randomDigits);
  };
  
  const handleCreateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let key = "";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(getSecureRandomInt(0, chars.length - 1));
    }
    setSecretKey(key);
    toast.success("New prototype 2FA key generated");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Shield className="h-4 w-4 mr-2" />
          2FA Code (Prototype)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication (Demo)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex gap-2.5 items-start">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Prototype Demonstration Only</p>
              <p className="mt-0.5 opacity-90">
                This feature is an experimental design concept and does not implement RFC 6238 TOTP algorithms. Do not use this for real account protection.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <div className="flex gap-2">
              <Input
                id="secret-key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter or generate a demo key"
                className="font-mono text-xs"
              />
              <Button onClick={handleCreateKey} type="button" size="sm">
                Generate
              </Button>
            </div>
          </div>
          
          {secretKey && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Current Code</Label>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3 mr-1" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                
                <div className="flex justify-center py-2">
                  <InputOTP maxLength={6} value={code} readOnly>
                    <InputOTPGroup>
                      {code.split('').map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-1 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorGenerator;