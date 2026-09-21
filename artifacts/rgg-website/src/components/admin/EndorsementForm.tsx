import { useState, type FormEvent } from "react";

import {
  ENDORSEMENT_STATUSES,
  type EndorsementFormValues,
  type EndorsementStatus,
} from "@/types/admin";

interface EndorsementFormProps {
  initialValues?: Partial<EndorsementFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: EndorsementFormValues) => void | Promise<void>;
}

const EMPTY_VALUES: EndorsementFormValues = {
  name: "",
  title: "",
  organization: "",
  quote: "",
  photoUrl: "",
  sourceUrl: "",
  status: "draft",
  displayOrder: 0,
};

const inputClass =
  "mt-2 min-h-11 w-full border border-[#2A3C30] bg-[#0B0B0B] px-4 py-3 text-sm text-[#F4F1EA] outline-none transition-colors placeholder:text-[#405246] focus:border-[#C8A96B]";
const labelClass =
  "block text-[9px] font-bold uppercase tracking-[0.18em] text-[#8D998F]";

export default function EndorsementForm({
  initialValues,
  isSubmitting = false,
  submitLabel = "Save Endorsement",
  onSubmit,
}: EndorsementFormProps) {
  const [values, setValues] = useState<EndorsementFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof EndorsementFormValues>(
    key: K,
    value: EndorsementFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim() || !values.quote.trim()) {
      setError("Name and quotation are required.");
      return;
    }
    setError(null);
    await onSubmit({
      ...values,
      name: values.name.trim(),
      quote: values.quote.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {error && (
        <div role="alert" className="mb-8 border border-[#8C4A4A] bg-[#2A1212] px-5 py-4 text-sm text-[#F0B8B8]">
          {error}
        </div>
      )}
      <section className="border-t-0 border-[#1A2E20] py-10">
        <p className="mb-7 text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
          Verified commentary
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Name *
            <input required value={values.name} onChange={(event) => update("name", event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Title
            <input value={values.title ?? ""} onChange={(event) => update("title", event.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Organization
            <input value={values.organization ?? ""} onChange={(event) => update("organization", event.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Quotation *
            <textarea required rows={7} value={values.quote} onChange={(event) => update("quote", event.target.value)} className={inputClass} />
          </label>
        </div>
      </section>
      <section className="border-t border-[#1A2E20] py-10">
        <p className="mb-7 text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
          Sources and display
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Photo URL
            <input type="url" value={values.photoUrl ?? ""} onChange={(event) => update("photoUrl", event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Source URL
            <input type="url" value={values.sourceUrl ?? ""} onChange={(event) => update("sourceUrl", event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Display order
            <input type="number" min={0} value={values.displayOrder} onChange={(event) => update("displayOrder", Number.parseInt(event.target.value, 10) || 0)} className={inputClass} />
          </label>
        </div>
      </section>
      <section className="border-t border-[#1A2E20] py-10">
        <p className="mb-7 text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
          Publication status
        </p>
        <fieldset>
          <legend className="sr-only">Endorsement status</legend>
          <div className="flex flex-wrap gap-3">
            {ENDORSEMENT_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={values.status === status}
                onClick={() => update("status", status as EndorsementStatus)}
                className={`border px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] ${values.status === status ? "border-[#C8A96B] text-[#EDD99A]" : "border-[#2A3C30] text-[#718078]"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
      <div className="sticky bottom-0 flex justify-end border-t border-[#1A2E20] bg-[#080D09]/95 py-5 backdrop-blur-xl">
        <button type="submit" disabled={isSubmitting} className="min-h-11 border border-[#C8A96B] bg-[#C8A96B] px-7 text-[9px] font-bold uppercase tracking-[0.2em] text-[#07100A] disabled:opacity-50">
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}