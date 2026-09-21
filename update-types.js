const fs = require('fs');
const file = 'artifacts/rgg-website/src/types/admin.ts';
let code = fs.readFileSync(file, 'utf8');

const newTypes = `

export interface ThemeFormValues {
  name: string;
  slug: string;
  englishLabel: string;
  frenchLabel: string;
  description?: string | null;
  displayOrder?: number;
  active?: boolean;
}

export interface Theme extends ThemeFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  mediaType: "image" | "pdf";
  purpose: string;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface AdminActivity {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  administratorId?: string | null;
  createdAt: string;
}
`;
fs.writeFileSync(file, code + newTypes);
