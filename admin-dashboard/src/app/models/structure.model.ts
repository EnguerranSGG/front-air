import { FileEntity } from "./file.model";

export interface StructureType {
  structure_type_id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Structure {
    structure_id: number;
    name: string;
    description: string;
    address?: string;
    phone_number?: string;
    missions?: Mission[];
    link?: string;
    file?: FileEntity;
    file_id?: number;
    structure_type_id?: number;
    structure_type?: StructureType;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
  }

  export interface Mission {
    mission_id: number;
    content: string;
  }
  