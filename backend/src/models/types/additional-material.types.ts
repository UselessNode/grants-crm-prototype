/**
 * Интерфейсы для дополнительных материалов (additional_materials)
 */

export interface AdditionalMaterial {
  id?: number;
  application_id?: number | null;
  file_path: string;
  file_name: string;
  file_type?: string | null;
  file_bytes_size?: number | null;
  comment?: string | null;
  uploaded_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface AdditionalMaterialCreateData extends Omit<AdditionalMaterial, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'uploaded_at' | 'application_id'> {}

export interface AdditionalMaterialWithApplication extends AdditionalMaterial {
  application?: {
    id: number;
    title: string;
  } | null;
}

// Интерфейсы для работы с файлами

export interface FileCategory {
  id: number;
  name: string;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface FileInfo {
  id?: number;
  name: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  file_path?: string;
  file_name?: string;
  file_type: string;
  file_bytes_size?: number | null;
  created_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
  is_template?: boolean;
}
