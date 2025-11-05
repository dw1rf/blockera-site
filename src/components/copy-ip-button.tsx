"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CopyIpButtonProps {
  ipAddress: string;
}

export function CopyIpButton({ ipAddress }: CopyIpButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ipAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy IP", error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      className="group flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" /> Скопировано
        </>
      ) : (
        <>
          <CopyIcon className="h-4 w-4 transition-transform group-hover:rotate-6" />
          Скопировать IP
        </>
      )}
    </Button>
  );
}
