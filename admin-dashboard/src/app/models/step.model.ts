import { FileEntity } from "./file.model";

export interface Step {
    step_id: number;
    name: string;
    description: string;
    path_id: number;
    file?: FileEntity;
  }
  