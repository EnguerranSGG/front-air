import { FileEntity } from "./file.model";

export interface Partner {
  parteners_id: number;
  name: string;
  file?: FileEntity;
  file_id?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
} 