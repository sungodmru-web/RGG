import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminThemes,
  createAdminTheme,
  updateAdminTheme,
  deleteAdminTheme,
  listAdminMedia,
  requestMediaUploadUrl,
  registerMediaUpload,
  deleteAdminMedia,
  listAdminActivity,
  previewAdminPublication,
  listAdminPublications,
  listAdministrators,
  getAdminPublication,
  createAdminPublication,
  updateAdminPublication,
  deleteAdminPublication,
  listAdminEndorsements,
  getAdminEndorsement,
  createAdminEndorsement,
  updateAdminEndorsement,
  updateAdminEndorsementApproval,
  deleteAdminEndorsement,
  reorderAdminEndorsements,
  listAdminEnquiries,
  getAdminEnquiry,
  updateAdminEnquiryStatus,
} from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

export const keys = {
  all: ["admin"] as const,
  publications: () => [...keys.all, "publications"] as const,
  publication: (id: string) => [...keys.publications(), id] as const,
  publicationPreview: (id: string) =>
    [...keys.publication(id), "preview"] as const,
  themes: () => [...keys.all, "themes"] as const,
  media: (type?: "pdf" | "image", search?: string) => [...keys.all, "media", type, search] as const,
  activity: () => [...keys.all, "activity"] as const,
  administrators: () => [...keys.all, "administrators"] as const,
  endorsements: () => [...keys.all, "endorsements"] as const,
  endorsement: (id: string) => [...keys.endorsements(), id] as const,
  enquiries: () => [...keys.all, "enquiries"] as const,
  enquiry: (id: string) => [...keys.enquiries(), id] as const,
};

export function useAdminPublications() {
  return useQuery({
    queryKey: keys.publications(),
    queryFn: listAdminPublications,
  });
}

export function useAdminEnquiries() {
  return useQuery({ queryKey: keys.enquiries(), queryFn: listAdminEnquiries });
}
export function useAdminEnquiry(id?: string) {
  return useQuery({
    queryKey: id ? keys.enquiry(id) : [],
    queryFn: () => id ? getAdminEnquiry(id) : Promise.reject(new Error("No id")),
    enabled: !!id,
  });
}
export function useUpdateAdminEnquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewStatus }: { id: string; reviewStatus: "new" | "in_progress" | "resolved" }) =>
      updateAdminEnquiryStatus(id, reviewStatus),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(keys.enquiry(variables.id), data);
      queryClient.invalidateQueries({ queryKey: keys.enquiries() });
    },
  });
}

export function useAdminPublication(id?: string) {
  return useQuery({
    queryKey: id ? keys.publication(id) : [],
    queryFn: () => (id ? getAdminPublication(id) : Promise.reject(new Error("No id"))),
    enabled: !!id,
  });
}

export function useAdminPublicationPreview(id?: string) {
  return useQuery({
    queryKey: id ? keys.publicationPreview(id) : [],
    queryFn: () =>
      id
        ? previewAdminPublication(id)
        : Promise.reject(new Error("No id")),
    enabled: !!id,
  });
}

export function useCreateAdminPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminPublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.publications() });
    },
  });
}

export function useUpdateAdminPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof updateAdminPublication>[1] }) =>
      updateAdminPublication(id, values),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(keys.publication(variables.id), data);
      queryClient.invalidateQueries({ queryKey: keys.publications() });
    },
  });
}

export function useDeleteAdminPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminPublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.publications() });
    },
  });
}

export function useAdminThemes() {
  return useQuery({
    queryKey: keys.themes(),
    queryFn: listAdminThemes,
  });
}

export function useCreateAdminTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.themes() });
    },
  });
}

export function useDeleteAdminTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.themes() });
    },
  });
}

export function useUpdateAdminTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof updateAdminTheme>[1] }) =>
      updateAdminTheme(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.themes() });
    },
  });
}

export function useAdminMedia(type?: "pdf" | "image", search?: string) {
  return useQuery({
    queryKey: keys.media(type, search),
    queryFn: () => listAdminMedia(type, search),
  });
}

export function useDeleteAdminMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: keys.activity(),
    queryFn: listAdminActivity,
  });
}

export function useAdministrators() {
  return useQuery({
    queryKey: keys.administrators(),
    queryFn: listAdministrators,
  });
}

export function useAdminEndorsements() {
  return useQuery({
    queryKey: keys.endorsements(),
    queryFn: listAdminEndorsements,
  });
}

export function useAdminEndorsement(id?: string) {
  return useQuery({
    queryKey: id ? keys.endorsement(id) : [],
    queryFn: () => (id ? getAdminEndorsement(id) : Promise.reject(new Error("No id"))),
    enabled: !!id,
  });
}

export function useCreateAdminEndorsement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminEndorsement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.endorsements() });
    },
  });
}

export function useUpdateAdminEndorsement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof updateAdminEndorsement>[1] }) =>
      updateAdminEndorsement(id, values),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(keys.endorsement(variables.id), data);
      queryClient.invalidateQueries({ queryKey: keys.endorsements() });
    },
  });
}

export function useApproveAdminEndorsement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminEndorsementApproval,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(keys.endorsement(variables), data);
      queryClient.invalidateQueries({ queryKey: keys.endorsements() });
    },
  });
}

export function useDeleteAdminEndorsement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminEndorsement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.endorsements() });
    },
  });
}
