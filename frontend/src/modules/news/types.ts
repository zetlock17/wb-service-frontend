import type { NewsStatus } from "../../api/newsApi";

export interface AckEmployee {
  eid: string;
  full_name: string;
}

export interface AckOrgUnit {
  id: number;
  name: string;
  level: number;
}

export type AckTargetMode = 'employees' | 'departments';

export interface NewNewsFormState {
  title: string;
  short_description: string;
  content: string;
  category_ids: number[];
  is_pinned: boolean;
  mandatory_ack: boolean;
  comments_enabled: boolean;
  status: NewsStatus;
  scheduled_publish_at: string;
  expires_at: string;
  tag_names: string;
  file_ids: number[];
  ack_target_all: boolean;
}

export interface UploadedFile {
  id: number;
  name: string;
}
