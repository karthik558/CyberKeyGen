
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  modifier?: "ctrl" | "alt" | "shift" | "meta";
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) ||
        document.querySelector('[role="dialog"][data-state="open"]')
      ) {
        return;
      }

      const matchedShortcut = shortcuts.find((shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const modifierMatch = 
          (shortcut.modifier === "ctrl" && e.ctrlKey) ||
          (shortcut.modifier === "alt" && e.altKey) ||
          (shortcut.modifier === "shift" && e.shiftKey) ||
          (shortcut.modifier === "meta" && e.metaKey) ||
          (!shortcut.modifier && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey);
        
        return keyMatch && modifierMatch;
      });

      if (matchedShortcut) {
        e.preventDefault();
        matchedShortcut.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening, shortcuts]);

  const toggleListening = () => {
    setIsListening(!isListening);
    toast.info(isListening ? "Keyboard shortcuts disabled" : "Keyboard shortcuts enabled");
  };

  return { isListening, toggleListening };
}

export const getShortcutDisplay = (shortcut: KeyboardShortcut): string => {
  const modifierSymbol = 
    shortcut.modifier === "ctrl" ? "Ctrl + " :
    shortcut.modifier === "alt" ? "Alt + " :
    shortcut.modifier === "shift" ? "Shift + " :
    shortcut.modifier === "meta" ? "⌘ + " : "";
  
  return `${modifierSymbol}${shortcut.key.toUpperCase()}`;
};
