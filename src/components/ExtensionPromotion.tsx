import { useEffect, useState } from "react";
import { Download, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const dismissalKey = "cyberkeygen-extension-promotion-dismissed";

const ExtensionPromotion = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // The extension publishes only its presence, never password data.
    const installed = () => document.documentElement.hasAttribute("data-cyberkeygen-extension");
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(dismissalKey) === "true" ||
        localStorage.getItem(dismissalKey) === "true";
    } catch { /* The popup still works when browser storage is unavailable. */ }
    if (dismissed || installed() || !window.matchMedia("(min-width: 768px)").matches) return;

    // document_idle content scripts can arrive after the React app mounts.
    const observer = new MutationObserver(() => {
      if (installed()) setOpen(false);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-cyberkeygen-extension"] });
    const timer = window.setTimeout(() => {
      if (!installed() && window.matchMedia("(min-width: 768px)").matches) setOpen(true);
    }, 1500);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const dismiss = (alreadyInstalled = false) => {
    setOpen(false);
    try {
      sessionStorage.setItem(dismissalKey, "true");
      if (alreadyInstalled) localStorage.setItem(dismissalKey, "true");
    } catch { /* Dismissing never depends on storage access. */ }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) dismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-secondary">
            <Puzzle className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Take it with you</p>
          <DialogTitle className="text-2xl leading-tight">A stronger password, one click away.</DialogTitle>
          <DialogDescription>Keep CyberKeyGen in your browser toolbar. Generate passwords without leaving the page you’re on.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button asChild>
            <a href="https://github.com/karthik558/CyberKeyGen/releases" target="_blank" rel="noopener noreferrer" onClick={() => dismiss()}>
              <Download className="h-4 w-4" /> Get the extension
            </a>
          </Button>
          <Button variant="outline" onClick={() => dismiss()}>Maybe later</Button>
          <Button variant="ghost" onClick={() => dismiss(true)}>Already installed</Button>
          <p className="text-center text-xs text-muted-foreground">Download from GitHub · Opens a new tab</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionPromotion;
