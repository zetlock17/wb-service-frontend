import type { Document } from "../../api/documentsApi";

export interface BrowserFolder {
  id: number;
  name: string;
  path: string;
  parent_id: number | null;
}

export interface EditingDocumentData {
  title: string;
  type: string;
  description: string;
  status: Document["status"];
  curator_id: string | null;
}
