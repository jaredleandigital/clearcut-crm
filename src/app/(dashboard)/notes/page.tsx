"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NoteEditor } from "@/components/notes/note-editor";
import { Plus, Pencil, Trash2 } from "lucide-react";

function NotesContent() {
  const notes = useQuery(api.notes.list);
  const removeNote = useMutation(api.notes.remove);
  const [editingNote, setEditingNote] = useState<Id<"notes"> | null>(null);
  const [creating, setCreating] = useState(false);

  if (notes === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading notes...</div>
      </div>
    );
  }

  const noteBeingEdited = editingNote
    ? notes.find((n) => n._id === editingNote)
    : null;

  if (creating || noteBeingEdited) {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold">
          {noteBeingEdited ? "Edit Note" : "New Note"}
        </h2>
        <NoteEditor
          note={
            noteBeingEdited
              ? {
                  _id: noteBeingEdited._id,
                  title: noteBeingEdited.title,
                  content: noteBeingEdited.content,
                }
              : undefined
          }
          onDone={() => {
            setCreating(false);
            setEditingNote(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No notes yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setCreating(true)}
          >
            Create your first note
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note._id}
              className="group rounded-lg border bg-background p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{note.title}</h3>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingNote(note._id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeNote({ id: note._id })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <>
      <SignedIn>
        <NotesContent />
      </SignedIn>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Sign in to view notes</h2>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
