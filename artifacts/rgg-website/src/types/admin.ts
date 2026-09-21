import type {
  PublicationType,
  ResearchAuthor,
} from "@/types/research";

export const PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export interface PublicationFormValues {
  slug: string;
  title: string;
  subtitle?: string | null;
  abstract: string;
  content?: string | null;
  publicationType: PublicationType;
  category?: string | null;
  authors: ResearchAuthor[];
  themeId?: string | null;
  language?: "english" | "french" | "bilingual";
  pdfMediaId?: string | null;
  featuredImageMediaId?: string | null;
  publicationDate?: string | null;
  readingTime?: number | null;
  featured: boolean;
  pdfUrl?: string;
  externalUrl?: string | null;
  doi?: string | null;
  featuredImage?: string | null;
  status: PublicationStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface AdminPublication extends PublicationFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  publishedBy?: string | null;
  publishedAt?: string | null;
  archivedBy?: string | null;
  archivedAt?: string | null;
}

export const ENDORSEMENT_STATUSES = ["draft", "approved", "archived"] as const;
export type EndorsementStatus = (typeof ENDORSEMENT_STATUSES)[number];

export interface EndorsementFormValues {
  name: string;
  title?: string;
  organization?: string;
  quote: string;
  photoUrl?: string;
  sourceUrl?: string;
  status: EndorsementStatus;
  displayOrder: number;
  language?: "english" | "french" | "bilingual";
  verificationNote?: string | null;
  verified?: boolean;
  photoMediaId?: string | null;
}

export interface AdminEndorsement extends EndorsementFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface Administrator {
  id: string;
  name: string;
  clerkUserId: string | null;
  accountStatus: string;
  role: string;
  lastSignInAt: string | null;
  email?: string | null;
  accessStatus: string;
}

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

export const ENQUIRY_REVIEW_STATUSES = ["new", "in_progress", "resolved"] as const;
export type EnquiryReviewStatus = (typeof ENQUIRY_REVIEW_STATUSES)[number];
export interface Enquiry {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  enquiryType: string;
  subject: string;
  message: string;
  language: string;
  deliveryStatus: string;
  providerId: string | null;
  providerError: string | null;
  deliveryAttemptedAt: string | null;
  reviewStatus: EnquiryReviewStatus;
  createdAt: string;
  updatedAt: string;
}
export interface AdminEnquiryList {
  items: Enquiry[];
  counts: { total: number; new: number; inProgress: number; resolved: number; deliveryFailed: number };
}
