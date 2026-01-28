
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ textToCopy, buttonText, className }: { textToCopy: string, buttonText?: string, className?: string }) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) {
       toast({
        variant: "destructive",
        description: "Nothing to copy.",
      });
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({
        description: "Copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard.",
      });
    });
  };

  return (
    <Button
      variant="ghost"
      size={buttonText ? 'default' : 'icon'}
      onClick={handleCopy}
      className={cn("shrink-0", className)}
      aria-label="Copy"
    >
      {buttonText && <span className="mr-2">{buttonText}</span>}
      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
