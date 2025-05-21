import { FileEntity } from "./file.model";

export interface Value {
    value_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    file?: FileEntity;
  }
  