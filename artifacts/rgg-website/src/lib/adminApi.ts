import type {
  AdminEndorsement,
  AdminPublication,
  EndorsementFormValues,
  PublicationFormValues,
  Administrator,
  Theme,
  Media,
  AdminActivity,
  ThemeFormValues,
  Enquiry,
  AdminEnquiryList,
  EnquiryReviewStatus,

} from "@/types/admin";

let csrfToken: string | null = null;

export function clearAdminSecurityState() {
  csrfToken = null;
}

async function readServerError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? null;
  } catch {
    return null;
  }
}

async function safeErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) {
    return "Authentication required. Please sign in again.";
  }
  if (response.status === 403) {
    return "Security or session verification rejected this request.";
  }
  if (response.status >= 500) {
    return "Unable to complete the request. Please try again.";
  }
  return (
    (await readServerError(response)) ??
    `Unable to complete the request (status ${response.status}).`
  );
}

async function adminRequest<T>(
  path: string,
  init?: RequestInit,
  retried = false,
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const mutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (mutation && !csrfToken) {
    const csrfResponse = await fetch("/api/admin/csrf", {
      credentials: "include",
    });
    if (!csrfResponse.ok) {
      throw new Error(await safeErrorMessage(csrfResponse));
    }
    const csrfBody = (await csrfResponse.json()) as { csrfToken?: string };
    if (!csrfBody.csrfToken) throw new Error("Unable to obtain a security token.");
    csrfToken = csrfBody.csrfToken;
  }
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(mutation && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...init?.headers,
    },
  });

  if (
    response.status === 403 &&
    mutation &&
    !retried &&
    (await readServerError(response.clone()))?.includes("CSRF")
  ) {
    csrfToken = null;
    return adminRequest<T>(path, init, true);
  }
  if (!response.ok) {
    throw new Error(await safeErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function publicationPayload(values: Partial<PublicationFormValues>) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) => key !== "publicationDate" || value !== "",
    ),
  );
}

export function listAdminPublications() {
  return adminRequest<AdminPublication[]>("/api/admin/publications");
}

export function listAdministrators() {
  return adminRequest<Administrator[]>("/api/admin/administrators");
}

export function getAdminPublication(id: string) {
  return adminRequest<AdminPublication>(`/api/admin/publications/${id}`);
}

export function createAdminPublication(values: PublicationFormValues) {
  return adminRequest<AdminPublication>("/api/admin/publications", {
    method: "POST",
    body: JSON.stringify(publicationPayload(values)),
  });
}

export function updateAdminPublication(
  id: string,
  values: Partial<PublicationFormValues>,
) {
  return adminRequest<AdminPublication>(`/api/admin/publications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(publicationPayload(values)),
  });
}

export function deleteAdminPublication(id: string) {
  return adminRequest<void>(`/api/admin/publications/${id}`, {
    method: "DELETE",
  });
}

function endorsementPayload(values: Partial<EndorsementFormValues>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value === "" && ["title", "organization", "photoUrl", "sourceUrl"].includes(key)
        ? null
        : value,
    ]),
  );
}

export function listAdminEndorsements() {
  return adminRequest<AdminEndorsement[]>("/api/admin/endorsements");
}

export function getAdminEndorsement(id: string) {
  return adminRequest<AdminEndorsement>(`/api/admin/endorsements/${id}`);
}

export function createAdminEndorsement(values: EndorsementFormValues) {
  return adminRequest<AdminEndorsement>("/api/admin/endorsements", {
    method: "POST",
    body: JSON.stringify(endorsementPayload(values)),
  });
}

export function updateAdminEndorsement(
  id: string,
  values: Partial<EndorsementFormValues>,
) {
  return adminRequest<AdminEndorsement>(`/api/admin/endorsements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(endorsementPayload(values)),
  });
}

export function updateAdminEndorsementApproval(id: string) {
  return adminRequest<AdminEndorsement>(`/api/admin/endorsements/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "approved",
      approvalConfirmation:
        "I confirm that this endorsement is authentic and authorized for publication.",
    }),
  });
}

export function deleteAdminEndorsement(id: string) {
  return adminRequest<void>(`/api/admin/endorsements/${id}`, {
    method: "DELETE",
  });
}

export function reorderAdminEndorsements(
  items: Array<{ id: string; displayOrder: number }>,
) {
  return adminRequest<AdminEndorsement[]>("/api/admin/endorsements/order", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}

export function logoutAdministrator() {
  return adminRequest<void>("/api/admin/logout", {
    method: "POST",
  });
}

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
  return adminRequest<Theme>(`/api/admin/themes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deleteAdminTheme(id: string) {
  return adminRequest<void>(`/api/admin/themes/${id}`, {
    method: "DELETE",
  });
}

export function listAdminMedia(type?: "pdf" | "image", search?: string) {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (search) params.append("search", search);
  const q = params.toString() ? `?${params.toString()}` : "";
  return adminRequest<Media[]>(`/api/admin/media${q}`);
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
  return adminRequest<void>(`/api/admin/media/${id}`, {
    method: "DELETE",
  });
}

export function listAdminActivity() {
  return adminRequest<AdminActivity[]>("/api/admin/activity");
}

export function previewAdminPublication(id: string) {
  return adminRequest<AdminPublication>(`/api/admin/publications/${id}/preview`);
}

export function listAdminEnquiries() {
  return adminRequest<AdminEnquiryList>("/api/admin/enquiries");
}
export function getAdminEnquiry(id: string) {
  return adminRequest<Enquiry>(`/api/admin/enquiries/${id}`);
}
export function updateAdminEnquiryStatus(id: string, reviewStatus: EnquiryReviewStatus) {
  return adminRequest<Enquiry>(`/api/admin/enquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ reviewStatus }),
  });
}
