import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useAdminEnquiry, useUpdateAdminEnquiryStatus } from "@/hooks/use-admin-api";
import type { EnquiryReviewStatus } from "@/types/admin";

export default function AdminEnquiryDetail() {
  const [location] = useLocation();
  const id = location.split("/").pop();
  const { data, isLoading, isError } = useAdminEnquiry(id);
  const update = useUpdateAdminEnquiryStatus();
  if (isLoading) return <div className="p-6 text-[#9AA79F]">Loading enquiry…</div>;
  if (isError || !data) return <div className="p-6 text-[#D97777]" role="alert">Unable to load this enquiry.</div>;
  const setStatus = (reviewStatus: EnquiryReviewStatus) => update.mutate({ id: data.id, reviewStatus });
  return <div className="container mx-auto max-w-4xl space-y-6 p-6">
    <Link href="/admin/enquiries" className="text-xs uppercase tracking-wider text-[#C8A96B]">← All enquiries</Link>
    <div><h1 className="font-serif text-3xl text-[#F4F1EA]">{data.subject}</h1><p className="mt-1 text-[#9AA79F]">{format(new Date(data.createdAt), "MMMM d, yyyy · h:mm a")}</p></div>
    <section className="grid gap-4 rounded-lg border border-[#1A2E20] bg-[#162B1E] p-6 sm:grid-cols-2">
      <Info label="Name" value={data.name}/><Info label="Email" value={data.email}/><Info label="Organization" value={data.organization || "—"}/><Info label="Enquiry Type" value={data.enquiryType}/><Info label="Language" value={data.language}/><Info label="Delivery Status" value={data.deliveryStatus}/>
    </section>
    <section className="rounded-lg border border-[#1A2E20] bg-[#162B1E] p-6"><h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9AA79F]">Full message</h2><p className="whitespace-pre-wrap leading-7 text-[#F4F1EA]">{data.message}</p>{data.providerError && <p className="mt-5 text-sm text-[#D97777]">Provider error: {data.providerError}</p>}</section>
    <section className="rounded-lg border border-[#1A2E20] bg-[#162B1E] p-6"><h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9AA79F]">Review status</h2><div className="flex flex-wrap gap-2">{(["new","in_progress","resolved"] as const).map(status => <button key={status} type="button" onClick={() => setStatus(status)} disabled={update.isPending} className={`border px-4 py-2 text-xs font-bold uppercase tracking-wider ${data.reviewStatus === status ? "border-[#C8A96B] bg-[#C8A96B] text-[#07100A]" : "border-[#405246] text-[#B8B39F] hover:border-[#C8A96B]"}`}>{status.replace("_", " ")}</button>)}</div>{update.isError && <p className="mt-3 text-sm text-[#D97777]" role="alert">{update.error.message}</p>}</section>
  </div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs uppercase tracking-wider text-[#718078]">{label}</dt><dd className="mt-1 text-[#F4F1EA]">{value}</dd></div>; }