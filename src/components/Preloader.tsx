import { useEffect } from "react";
import { KeyRound, Loader2 } from "lucide-react";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const finish = () => onComplete();
    // Do not let slow assets indefinitely block access to the generator.
    const fallback = window.setTimeout(finish, 2500);
    let frame: number | undefined;
    if (document.readyState === "complete") {
      frame = window.requestAnimationFrame(finish);
    } else {
      window.addEventListener("load", finish, { once: true });
    }
    return () => {
      window.clearTimeout(fallback);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener("load", finish);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background text-foreground" role="status" aria-live="polite">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card">
        <KeyRound className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold tracking-tight">CyberKeyGen</p>
        <p className="mt-1 text-sm text-muted-foreground">Opening your password workspace</p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none text-muted-foreground" aria-hidden="true" />
    </div>
  );
};

export default Preloader;
