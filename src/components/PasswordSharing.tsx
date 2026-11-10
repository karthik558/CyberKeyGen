/**
 * EXPERIMENTAL PROTOTYPE - UNLINKED / NOT FOR PRODUCTION USE
 * 
 * This component is an experimental prototype and is NOT linked into the CyberKeyGen production interface.
 * It encodes data into a URL hash fragment for UI testing and does NOT provide end-to-end encryption
 * (such as Web Crypto SubtleCrypto AES-GCM) or a zero-knowledge backend.
 * Do NOT use this for sharing sensitive or production credentials.
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Share2, Copy, CheckIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface PasswordSharingProps {
  password: string;
  strength: "weak" | "moderate" | "strong" | "very-strong";
}

const PasswordSharing: React.FC<PasswordSharingProps> = ({ password, strength }) => {
  const [includePassword, setIncludePassword] = useState(true);
  const [includeStrength, setIncludeStrength] = useState(true);
  const [expirationHours, setExpirationHours] = useState(24);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  
  const generateShareLink = () => {
    if (!password) {
      toast.error("Generate a password first!");
      return;
    }
    
    // Wireframe mock: base64 fragment (NOT end-to-end encrypted)
    const data = {
      p: includePassword ? password : undefined,
      s: includeStrength ? strength : undefined,
      e: new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString(),
    };
    
    const encodedData = btoa(JSON.stringify(data));
    const link = `${window.location.origin}/shared#${encodedData}`;
    
    setShareLink(link);
    toast.info("Demo share link generated (unencrypted prototype)");
  };
  
  const copyShareLink = () => {
    if (!shareLink) {
      generateShareLink();
      setTimeout(() => {
        navigator.clipboard.writeText(shareLink).catch(() => {});
        setCopied(true);
        toast.success("Demo link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      }, 100);
    } else {
      navigator.clipboard.writeText(shareLink).catch(() => {});
      setCopied(true);
      toast.success("Demo link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Share2 className="h-4 w-4 mr-2" />
          Share (Prototype)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Password (Demo Concept)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex gap-2.5 items-start">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unencrypted Prototype Only</p>
              <p className="mt-0.5 opacity-90">
                This is a mock UI demonstration. Links generated here are encoded in the URL hash and are not backed by zero-knowledge end-to-end encryption.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-password" className="text-sm cursor-pointer">
                Include password in share
              </Label>
              <Switch
                id="include-password"
                checked={includePassword}
                onCheckedChange={setIncludePassword}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-strength" className="text-sm cursor-pointer">
                Include strength analysis
              </Label>
              <Switch
                id="include-strength"
                checked={includeStrength}
                onCheckedChange={setIncludeStrength}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiration" className="text-sm">
                Link expires after (hours)
              </Label>
              <Input
                id="expiration"
                type="number"
                min="1"
                max="720"
                value={expirationHours}
                onChange={(e) => setExpirationHours(parseInt(e.target.value) || 24)}
              />
            </div>
            
            {shareLink && (
              <div className="space-y-2">
                <Label htmlFor="share-link" className="text-sm">
                  Demo Link
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    id="share-link"
                    readOnly
                    value={shareLink}
                    className="font-mono text-xs h-20"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={copyShareLink}
                    className="h-20"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-foreground" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button onClick={generateShareLink}>
                Generate Demo Link
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordSharing;