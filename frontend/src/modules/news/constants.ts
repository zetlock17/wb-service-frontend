import type { NewNewsFormState } from "./types";

export const PAGE_SIZE = 10;

export const createInitialFormState = (defaultCategoryId?: number): NewNewsFormState => ({
  title: '',
  short_description: '',
  content: '',
  category_ids: defaultCategoryId ? [defaultCategoryId] : [],
  is_pinned: false,
  mandatory_ack: false,
  comments_enabled: true,
  status: 'PUBLISHED',
  scheduled_publish_at: '',
  expires_at: '',
  tag_names: '',
  file_ids: [],
  ack_target_all: true,
});
