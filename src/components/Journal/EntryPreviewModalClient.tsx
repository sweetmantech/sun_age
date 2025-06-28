"use client";
import { EntryPreviewModal } from "./EntryPreviewModal";
import type { JournalEntry } from "~/types/journal";

export default function EntryPreviewModalClient(props: any) {
  return <EntryPreviewModal {...props} />;
} 