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

export interface PhotoWriterJunction {
  writers_id: string | Writer;
}

export interface PhotoCrewJunction {
  crews_id: string | Crew;
}

export interface Photo {
  id: string;
  file: string | DirectusFile;
  writer: string | Writer | null;
  crew: string | Crew | null;
  writers?: PhotoWriterJunction[];
  crews?: PhotoCrewJunction[];
  _allWriters?: Array<{ id: string; tag: string }>;
  _allCrews?: Array<{ id: string; name: string }>;
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

export interface SfUser {
  id: string;
  tag: string;
  password_hash: string;
  verified: boolean;
  challenge_code: string | null;
  handstyle_file: string | null;
  bio: string | null;
  origin: string | null;
  active_since: number | null;
  created_week_hash: string | null;
}

export interface SfSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
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
