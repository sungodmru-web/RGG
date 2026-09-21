const fs = require('fs');
const path = require('path');
const file = 'artifacts/rgg-website/src/lib/adminApi.ts';
let code = fs.readFileSync(file, 'utf8');

const newTypes = `
  Theme,
  Media,
  AdminActivity,
  ThemeFormValues,
`;
code = code.replace('Administrator,', 'Administrator,' + newTypes);

const newApi = `

export function listAdminThemes() {
  return adminRequest<Theme[]>("/api/admin/themes");
}

export function createAdminTheme(values: ThemeFormValues) {
  return adminRequest<Theme>("/api/admin/themes", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateAdminTheme(id: string, values: Partial<ThemeFormValues>) {
  return adminRequest<Theme>(\`/api/admin/themes/\${id}\`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deleteAdminTheme(id: string) {
  return adminRequest<void>(\`/api/admin/themes/\${id}\`, {
    method: "DELETE",
  });
}

export function listAdminMedia(type?: "pdf" | "image", search?: string) {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (search) params.append("search", search);
  const q = params.toString() ? \`?\${params.toString()}\` : "";
  return adminRequest<Media[]>(\`/api/admin/media\${q}\`);
}

export function requestMediaUploadUrl(metadata: { name: string; size: number; contentType: string; purpose: string }) {
  return adminRequest<{ uploadURL: string; objectPath: string; maxBytes?: number }>("/api/admin/media/request-url", {
    method: "POST",
    body: JSON.stringify(metadata),
  });
}

export function registerMediaUpload(data: { name: string; size: number; contentType: string; purpose: string; objectPath: string }) {
  return adminRequest<Media>("/api/admin/media/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteAdminMedia(id: string) {
  return adminRequest<void>(\`/api/admin/media/\${id}\`, {
    method: "DELETE",
  });
}

export function listAdminActivity() {
  return adminRequest<AdminActivity[]>("/api/admin/activity");
}

export function previewAdminPublication(id: string) {
  return adminRequest<AdminPublication>(\`/api/admin/publications/\${id}/preview\`);
}
`;

code = code + newApi;
fs.writeFileSync(file, code);
