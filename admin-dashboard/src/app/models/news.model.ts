import { FileEntity } from "./file.model";

export interface News {
  news_id: number;
  name: string;
  description: string;
  link?: string;
  user_id: string;
  file?: FileEntity;
}
