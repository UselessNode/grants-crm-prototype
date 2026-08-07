// frontend/src/components/application-view/additional-materials.tsx
import type { AdditionalMaterial } from "../../types";

interface AdditionalMaterialsProps {
  materials: AdditionalMaterial[];
}

export function AdditionalMaterials({ materials }: AdditionalMaterialsProps) {
  if (!materials || materials.length === 0) return null;

  return (
    <div className="sidebar-card">
      <h3 className="sidebar-title">Дополнительные материалы</h3>
      <div className="space-y-1">
        {materials.map((material) => (
          <div key={material.id} className="material-item">
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="material-link"
            >
              {material.file_name || "Файл без названия"}
            </a>
            {material.file_size && (
              <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                {(material.file_size / 1024 / 1024).toFixed(2)} МБ
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
