import { FileEntity } from "./file.model";

export interface News {
  news_id: number;
  title: string;
  content: string;
  user_id: string;
  file?: FileEntity;
}
