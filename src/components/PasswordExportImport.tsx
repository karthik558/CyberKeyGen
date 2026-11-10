import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Download, 
  Upload, 
  FileJson,
  FileUp
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface StoredPasswordItem {
  password: string;
  timestamp: Date;
  strength: "weak" | "moderate" | "strong" | "very-strong";
  type: "random" | "leet" | "pin";
  category?: string;
}

export interface ExportSchemaV1 {
  version: 1;
  app: "CyberKeyGen";
  exportedAt: string;
  items: Array<{
    password: string;
    timestamp: string;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>;
}

interface PasswordExportImportProps {
  passwordHistory: StoredPasswordItem[];
  onImport: (passwords: StoredPasswordItem[]) => void;
}

const MAX_IMPORT_ITEMS = 200;
const MAX_PASSWORD_LENGTH = 256;
const MAX_CATEGORY_LENGTH = 50;

const VALID_STRENGTHS = new Set(["weak", "moderate", "strong", "very-strong"]);
const VALID_TYPES = new Set(["random", "leet", "pin"]);

function validateAndNormalizeItems(rawList: unknown[]): StoredPasswordItem[] {
  const result: StoredPasswordItem[] = [];

  for (const raw of rawList) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;

    if (typeof item.password !== "string" || !item.password.trim()) continue;
    const cleanPassword = item.password.trim().slice(0, MAX_PASSWORD_LENGTH);

    // Validate timestamp
    let timestamp = new Date();
    if (typeof item.timestamp === "string" || typeof item.timestamp === "number") {
      const parsed = new Date(item.timestamp);
      if (!isNaN(parsed.getTime())) {
        timestamp = parsed;
      }
    } else if (item.timestamp instanceof Date && !isNaN(item.timestamp.getTime())) {
      timestamp = item.timestamp;
    }

    // Validate strength
    let strength: StoredPasswordItem["strength"] = "moderate";
    if (typeof item.strength === "string" && VALID_STRENGTHS.has(item.strength)) {
      strength = item.strength as StoredPasswordItem["strength"];
    }

    // Validate type
    let type: StoredPasswordItem["type"] = "random";
    if (typeof item.type === "string" && VALID_TYPES.has(item.type)) {
      type = item.type as StoredPasswordItem["type"];
    }

    // Preserve category
    let category = "uncategorized";
    if (typeof item.category === "string" && item.category.trim()) {
      category = item.category.trim().slice(0, MAX_CATEGORY_LENGTH);
    }

    result.push({
      password: cleanPassword,
      timestamp,
      strength,
      type,
      category,
    });

    if (result.length >= MAX_IMPORT_ITEMS) break;
  }

  return result;
}

const PasswordExportImport: React.FC<PasswordExportImportProps> = ({
  passwordHistory,
  onImport,
}) => {
  const [importData, setImportData] = useState("");
  const [activeTab, setActiveTab] = useState("export");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (passwordHistory.length === 0) {
      toast.error("No passwords to export");
      return;
    }

    const exportPayload: ExportSchemaV1 = {
      version: 1,
      app: "CyberKeyGen",
      exportedAt: new Date().toISOString(),
      items: passwordHistory.map(item => ({
        password: item.password,
        timestamp: item.timestamp instanceof Date ? item.timestamp.toISOString() : new Date(item.timestamp).toISOString(),
        strength: item.strength,
        type: item.type,
        category: item.category || "uncategorized",
      })),
    };

    const exportData = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cyberkeygen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`${exportPayload.items.length} passwords exported securely`);
  };

  const processImportString = (jsonString: string) => {
    if (!jsonString.trim()) {
      toast.error("Please paste or upload JSON password data");
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      let rawItems: unknown[] = [];

      if (Array.isArray(parsed)) {
        // Legacy raw array format
        rawItems = parsed;
      } else if (parsed && typeof parsed === "object") {
        // Versioned schema v1
        if (Array.isArray(parsed.items)) {
          rawItems = parsed.items;
        } else {
          toast.error("Unrecognized backup schema. Missing 'items' array.");
          return;
        }
      } else {
        toast.error("Invalid import format. Expected a JSON object or array.");
        return;
      }

      const validated = validateAndNormalizeItems(rawItems);
      if (validated.length === 0) {
        toast.error("No valid password items found in the provided data.");
        return;
      }

      onImport(validated);
      setImportData("");
      toast.success(`${validated.length} passwords imported successfully`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Invalid JSON format. Please check the backup file.");
    }
  };

  const handleImport = () => {
    processImportString(importData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large (max 2MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setImportData(content);
        processImportString(content);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline" 
          size="sm" 
          aria-label="Backup: export or import passwords"
          className="border-border/60"
        >
          <FileJson className="h-4 w-4" />
          <span>Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileJson className="h-5 w-5" />
            Backup & Restore
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground">
              Download your password history as a versioned JSON backup with categories and strength metadata.
            </p>

            {passwordHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-secondary/50">
                  <p className="text-sm font-medium">
                    {passwordHistory.length} password{passwordHistory.length !== 1 ? "s" : ""} available to export
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Schema version 1.0 (CyberKeyGen)
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Backup
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border rounded-lg border-dashed">
                <p className="text-sm text-muted-foreground">
                  No passwords in history to export. Generate a password first.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground">
              Import passwords from a CyberKeyGen JSON backup file or paste raw backup data below.
            </p>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4" />
                Upload .json file
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-data" className="text-xs">Or paste JSON directly</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='{"version": 1, "app": "CyberKeyGen", "items": [{"password": "...", "type": "random", "category": "work"}]}'
                className="font-mono h-28 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleImport} className="gap-2">
                <Upload className="h-4 w-4" />
                Import Passwords
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Imported items are merged with existing history (duplicates skipped, up to {MAX_IMPORT_ITEMS} total). Categories and timestamps are preserved.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordExportImport;