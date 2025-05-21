import { FileEntity } from "./file.model";

export interface Structure {
    structure_id: number;
    name: string;
    description: string;
    address?: string;
    phone_number?: string;
    missions?: Mission[];
    link?: string;
    file?: FileEntity;
  }
  
  export interface Mission {
    mission_id: number;
    content: string;
  }
  