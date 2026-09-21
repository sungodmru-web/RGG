import { useState, type FormEvent } from "react";

import { PUBLICATION_TYPE_OPTIONS } from "@/content/researchContent";
import type {
  PublicationFormValues,
  PublicationStatus,
} from "@/types/admin";
import type { PublicationType, ResearchAuthor } from "@/types/research";

interface PublicationFormProps {
  initialValues?: Partial<PublicationFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: PublicationFormValues) => void | Promise<void>;
}

const EMPTY_VALUES: PublicationFormValues = {
  slug: "",
  title: "",
  subtitle: "",
  abstract: "",
  content: "",
  publicationType: "research-paper",
  category: "",
  authors: [],
  publicationDate: "",
  readingTime: undefined,
  featured: false,
  pdfUrl: "",
  externalUrl: "",
  doi: "",
  featuredImage: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
};

const inputClass =
  "mt-2 min-h-11 w-full border border-[#2A3C30] bg-[#0B0B0B] px-4 py-3 text-sm text-[#F4F1EA] outline-none transition-colors placeholder:text-[#405246] focus:border-[#C8A96B]";
const labelClass =
  "block text-[9px] font-bold uppercase tracking-[0.18em] text-[#8D998F]";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function authorsToText(authors: ResearchAuthor[]) {
  return authors
    .map((author) =>
      author.role ? `${author.name} | ${author.role}` : author.name,
    )
    .join("\n");
}

function parseAuthors(value: string): ResearchAuthor[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...roleParts] = line.split("|");
      const role = roleParts.join("|").trim();

      return {
        name: name.trim(),
        ...(role ? { role } : {}),
      };
    });
}

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#1A2E20] py-10 first:border-t-0 first:pt-0">
      <p className="mb-7 text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
        {eyebrow}
      </p>
      {children}
    </section>
  );
}

export default function PublicationForm({
  initialValues,
  isSubmitting = false,
  submitLabel = "Save Publication",
  onSubmit,
}: PublicationFormProps) {
  const [values, setValues] = useState<PublicationFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    authors: initialValues?.authors ?? EMPTY_VALUES.authors,
  });
  const [authorsText, setAuthorsText] = useState(() =>
    authorsToText(initialValues?.authors ?? []),
  );
  const [slugEdited, setSlugEdited] = useState(Boolean(initialValues?.slug));
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PublicationFormValues>(
    key: K,
    value: PublicationFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const authors = parseAuthors(authorsText);

    if (!values.title.trim() || !values.slug.trim() || !values.abstract.trim()) {
      setError("Title, slug and abstract are required.");
      return;
    }

    if (authors.length === 0 || authors.some((author) => !author.name)) {
      setError("Add at least one author.");
      return;
    }

    setError(null);
    await onSubmit({
      ...values,
      title: values.title.trim(),
      slug: createSlug(values.slug),
      abstract: values.abstract.trim(),
      authors,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl">
      {error && (
        <div
          role="alert"
          className="mb-8 border border-[#8C4A4A] bg-[#2A1212] px-5 py-4 text-sm text-[#F0B8B8]"
        >
          {error}
        </div>
      )}

      <Section eyebrow="Publication">
        <div className="grid gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Title *
            <input
              required
              value={values.title}
              onChange={(event) => {
                const title = event.target.value;
                update("title", title);
                if (!slugEdited) update("slug", createSlug(title));
              }}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Slug *
            <input
              required
              value={values.slug}
              onChange={(event) => {
                setSlugEdited(true);
                update(
                  "slug",
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/-{2,}/g, "-")
                    .replace(/^-+/, ""),
                );
              }}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Subtitle
            <input
              value={values.subtitle ?? ""}
              onChange={(event) => update("subtitle", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Abstract *
            <textarea
              required
              rows={5}
              value={values.abstract}
              onChange={(event) => update("abstract", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Body / Content
            <textarea
              rows={14}
              value={values.content ?? ""}
              onChange={(event) => update("content", event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </Section>

      <Section eyebrow="Classification">
        <div className="grid gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Publication Type *
            <select
              required
              value={values.publicationType}
              onChange={(event) =>
                update("publicationType", event.target.value as PublicationType)
              }
              className={inputClass}
            >
              {PUBLICATION_TYPE_OPTIONS.filter(
                (option) => option.value !== "all",
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Category
            <input
              value={values.category ?? ""}
              onChange={(event) => update("category", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Authors *
            <textarea
              required
              rows={4}
              value={authorsText}
              onChange={(event) => setAuthorsText(event.target.value)}
              placeholder={"One author per line\nName | Optional role"}
              className={inputClass}
            />
          </label>
        </div>
      </Section>

      <Section eyebrow="Publication Details">
        <div className="grid gap-6 md:grid-cols-3">
          <label className={labelClass}>
            Publication Date
            <input
              type="date"
              value={values.publicationDate ?? ""}
              onChange={(event) => update("publicationDate", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Reading Time
            <input
              type="number"
              min={1}
              value={values.readingTime ?? ""}
              onChange={(event) =>
                update(
                  "readingTime",
                  event.target.value
                    ? Number.parseInt(event.target.value, 10)
                    : undefined,
                )
              }
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} flex items-center gap-3 pt-7`}>
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => update("featured", event.target.checked)}
              className="size-4 accent-[#C8A96B]"
            />
            Featured
          </label>
        </div>
      </Section>

      <Section eyebrow="Links">
        <div className="grid gap-6 md:grid-cols-2">
          {(
            [
              ["pdfUrl", "PDF URL"],
              ["externalUrl", "External URL"],
              ["doi", "DOI"],
              ["featuredImage", "Featured Image"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={labelClass}>
              {label}
              <input
                type={key === "doi" ? "text" : "url"}
                value={values[key] ?? ""}
                onChange={(event) => update(key, event.target.value)}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </Section>

      <Section eyebrow="SEO">
        <div className="grid gap-6 md:grid-cols-2">
          <label className={labelClass}>
            SEO Title
            <input
              value={values.seoTitle ?? ""}
              onChange={(event) => update("seoTitle", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            SEO Description
            <textarea
              rows={3}
              value={values.seoDescription ?? ""}
              onChange={(event) => update("seoDescription", event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </Section>

      <Section eyebrow="Status">
        <fieldset>
          <legend className="sr-only">Publication status</legend>
          <div className="flex flex-wrap gap-3">
            {(["draft", "published", "archived"] as PublicationStatus[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  aria-label={status}
                  aria-pressed={values.status === status}
                  onClick={() => update("status", status)}
                  className={`cursor-pointer border px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] ${
                    values.status === status
                      ? "border-[#C8A96B] text-[#EDD99A]"
                      : "border-[#2A3C30] text-[#718078]"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </fieldset>
      </Section>

      <div className="sticky bottom-0 flex items-center justify-end border-t border-[#1A2E20] bg-[#080D09]/95 py-5 backdrop-blur-xl">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 border border-[#C8A96B] bg-[#C8A96B] px-7 text-[9px] font-bold uppercase tracking-[0.2em] text-[#07100A] transition-colors hover:bg-[#EDD99A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}