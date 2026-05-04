"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  onConfirm: () => void;
}

const CONFIRM_TEXT = "Delete Lead";

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  leadName,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue === CONFIRM_TEXT;

  function handleConfirm() {
    if (!isMatch) return;
    onConfirm();
    setInputValue("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) setInputValue("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{leadName}</strong>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="delete-confirm">
            Type <span className="font-mono font-semibold text-destructive">{CONFIRM_TEXT}</span> to confirm
          </Label>
          <Input
            id="delete-confirm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={CONFIRM_TEXT}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isMatch) handleConfirm();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isMatch}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
