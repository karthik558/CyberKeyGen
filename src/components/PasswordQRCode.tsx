
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { toast } from "sonner";

interface PasswordQRCodeProps {
  password: string;
}

const PasswordQRCode = ({ password }: PasswordQRCodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    if (!password) {
      toast.error("Generate a password first!");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Create QR Code"
          aria-label="Create QR code"
          disabled={!password}
          onClick={handleClick}
          className="h-9 w-9"
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to easily transfer your password to another device
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {password ? (
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={password}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No password generated yet</p>
          )}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Note: QR codes store data in plain text. Only share this QR code securely.
          </p>
        </div>
        <DialogClose asChild>
          <Button className="w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordQRCode;
