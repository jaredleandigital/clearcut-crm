"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NoteEditorProps {
  note?: {
    _id: Id<"notes">;
    title: string;
    content: string;
  };
  onDone: () => void;
}

export function NoteEditor({ note, onDone }: NoteEditorProps) {
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (note) {
      await updateNote({ id: note._id, title, content });
    } else {
      await createNote({ title, content });
    }

    setLoading(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note-title">Title *</Label>
        <Input
          id="note-title"
          name="title"
          required
          defaultValue={note?.title ?? ""}
          placeholder="Note title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note-content">Content *</Label>
        <Textarea
          id="note-content"
          name="content"
          required
          defaultValue={note?.content ?? ""}
          placeholder="Write your note..."
          className="min-h-[200px]"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : note ? "Update Note" : "Create Note"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
