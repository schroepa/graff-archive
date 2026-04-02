export interface Writer {
  id: string;
  tag: string;
  crew: string | Crew | null;
  active_since: number | null;
  bio: string | null;
}

export interface Crew {
  id: string;
  name: string;
  founded: number | null;
  origin_city: string | null;
}

export interface StyleTag {
  id: string;
  name: string;
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Photo {
  id: string;
  file: string | DirectusFile;
  writer: string | Writer | null;
  crew: string | Crew | null;
  location_city: string | null;
  location_country: string | null;
  year: number | null;
  style_tags: PhotoStyleTag[] | string[];
  moderation_status: ModerationStatus;
  flagged: boolean;
  is_legal_wall: boolean;
  uploaded_at: string;
  burner_count: number;
}

export interface PhotoStyleTag {
  id: number;
  photos_id: string;
  style_tags_id: string | StyleTag;
}

export interface DirectusFile {
  id: string;
  filename_download: string;
  width: number | null;
  height: number | null;
}

// Hilfsfunktionen für Type Narrowing
export function isWriter(v: string | Writer | null): v is Writer {
  return typeof v === 'object' && v !== null && 'tag' in v;
}

export function isCrew(v: string | Crew | null): v is Crew {
  return typeof v === 'object' && v !== null && 'name' in v;
}

export function isDirectusFile(v: string | DirectusFile): v is DirectusFile {
  return typeof v === 'object' && v !== null && 'filename_download' in v;
}

export function isStyleTag(v: string | StyleTag): v is StyleTag {
  return typeof v === 'object' && v !== null && 'name' in v;
}
