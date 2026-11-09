
import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PasswordExpiryTimerProps {
  password: string;
  onPasswordExpiry: () => void;
}

const PasswordExpiryTimer = ({ password, onPasswordExpiry }: PasswordExpiryTimerProps) => {
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTimerActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            setIsTimerActive(false);
            onPasswordExpiry();
            toast.info("Password has expired and been cleared");
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, remainingTime, onPasswordExpiry]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (!password) {
      toast.error("Generate a password first!");
      return;
    }
    
    setRemainingTime(expiryMinutes * 60);
    setIsTimerActive(true);
    setPopoverOpen(false);
    toast.success(`Password will expire in ${expiryMinutes} ${expiryMinutes === 1 ? 'minute' : 'minutes'}`);
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setRemainingTime(0);
    toast.info("Password expiry timer cancelled");
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          title="Set Expiry Timer"
          aria-label="Set expiry timer"
          disabled={!password}
          className="h-9 w-9 relative"
        >
          <Clock className="h-4 w-4" />
          {isTimerActive && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {formatTime(remainingTime).split(":")[0]}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Password Expiry Timer</h4>
          <p className="text-xs text-muted-foreground">
            Set a timer for this password to be automatically cleared
          </p>
          
          {isTimerActive ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Time remaining:</p>
                <p className="text-2xl font-mono font-bold">{formatTime(remainingTime)}</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full" 
                onClick={stopTimer}
              >
                Cancel Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="expiry-minutes">Minutes until expiry</Label>
                  <span className="text-xs font-mono">{expiryMinutes} min</span>
                </div>
                <Slider
                  id="expiry-minutes"
                  min={1}
                  max={60}
                  step={1}
                  value={[expiryMinutes]}
                  onValueChange={(value) => setExpiryMinutes(value[0])}
                />
              </div>
              
              <Separator />
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={startTimer}
                >
                  Start Timer
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PasswordExpiryTimer;
