
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Download, 
  Upload, 
  FileJson,
  CheckIcon
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

interface PasswordExportImportProps {
  passwordHistory: Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>;
  onImport: (passwords: Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>) => void;
}

const PasswordExportImport: React.FC<PasswordExportImportProps> = ({
  passwordHistory,
  onImport,
}) => {
  const [importData, setImportData] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [activeTab, setActiveTab] = useState("export");
  const isMobile = useIsMobile();
  
  const handleExport = () => {
    if (passwordHistory.length === 0) {
      toast.error("No passwords to export");
      return;
    }
    
    const exportData = JSON.stringify(passwordHistory, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    setDownloadUrl(url);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `password-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Passwords exported successfully");
  };
  
  const handleImport = () => {
    if (!importData.trim()) {
      toast.error("Please paste exported password data");
      return;
    }
    
    try {
      const parsedData = JSON.parse(importData);
      
      if (!Array.isArray(parsedData)) {
        toast.error("Invalid import format. Expected an array.");
        return;
      }
      
      const validatedData = parsedData.map(item => ({
        password: item.password || "",
        timestamp: new Date(item.timestamp || Date.now()),
        strength: item.strength || "moderate",
        type: item.type || "random",
      }));
      
      onImport(validatedData);
      setImportData("");
      toast.success(`${validatedData.length} passwords imported successfully`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Invalid JSON format. Please check your data.");
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline" 
          size="sm" 
          aria-label="Backup: export or import passwords"
        >
          <FileJson className="h-4 w-4" />
          <span>Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Export/Import Passwords
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Export your password history as a JSON file that you can save securely or import later.
            </p>
            
            {passwordHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3 border rounded-md bg-secondary/20">
                  <p className="text-sm">
                    {passwordHistory.length} passwords available for export
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Passwords
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">
                  No passwords in history to export
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Import passwords from a previously exported JSON file.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="import-data">Paste exported JSON data</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[{"password": "example", "timestamp": "2023-01-01T00:00:00.000Z", "strength": "strong", "type": "random"}]'
                className="font-mono h-32 text-xs"
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import Passwords
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Note: Importing will add the passwords to your existing history without duplicating.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordExportImport;
