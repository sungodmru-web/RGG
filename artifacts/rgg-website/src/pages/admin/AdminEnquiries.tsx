import { Link } from "wouter";
import { format } from "date-fns";
import { useAdminEnquiries } from "@/hooks/use-admin-api";

export default function AdminEnquiries() {
  const { data, isLoading, isError } = useAdminEnquiries();
  return <div className="container mx-auto max-w-6xl space-y-6 p-6">
    <div><h1 className="font-serif text-3xl text-[#F4F1EA]">Enquiries</h1><p className="mt-1 text-[#9AA79F]">Review messages received from the website.</p></div>
    {isLoading && <p className="text-[#9AA79F]">Loading enquiries…</p>}
    {isError && <p role="alert" className="text-[#D97777]">Unable to load enquiries.</p>}
    {data && <div className="overflow-x-auto rounded-lg border border-[#1A2E20] bg-[#162B1E]">
      <div className="grid grid-cols-2 gap-3 border-b border-[#1A2E20] p-4 text-sm text-[#9AA79F] md:grid-cols-5">
        <span>Total <b className="text-[#F4F1EA]">{data.counts.total}</b></span><span>New <b className="text-[#F4F1EA]">{data.counts.new}</b></span><span>In progress <b className="text-[#F4F1EA]">{data.counts.inProgress}</b></span><span>Resolved <b className="text-[#F4F1EA]">{data.counts.resolved}</b></span><span>Delivery failed <b className="text-[#D97777]">{data.counts.deliveryFailed}</b></span>
      </div>
      <table className="min-w-[1050px] w-full text-left"><thead><tr className="border-b border-[#1A2E20] text-xs uppercase tracking-wider text-[#9AA79F]"><th className="p-4">Date</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Organization</th><th className="p-4">Enquiry Type</th><th className="p-4">Subject</th><th className="p-4">Delivery Status</th></tr></thead>
        <tbody>{data.items.map(item => <tr key={item.id} className="border-b border-[#1A2E20] last:border-0 hover:bg-[#1A2E20]"><td className="p-4 text-sm text-[#9AA79F]">{format(new Date(item.createdAt), "MMM d, yyyy")}</td><td className="p-4"><Link href={`/admin/enquiries/${item.id}`} className="text-[#EDD99A] hover:underline">{item.name}</Link></td><td className="p-4 text-sm text-[#B8B39F]">{item.email}</td><td className="p-4 text-sm text-[#B8B39F]">{item.organization || "—"}</td><td className="p-4 text-sm text-[#B8B39F]">{item.enquiryType}</td><td className="p-4 text-sm text-[#B8B39F]">{item.subject}</td><td className="p-4 text-sm">{item.deliveryStatus === "failed" ? <span className="text-[#D97777]">Failed</span> : <span className="text-[#A9D6A8]">{item.deliveryStatus}</span>}</td></tr>)}</tbody>
      </table>
      {data.items.length === 0 && <p className="p-8 text-center text-[#9AA79F]">No enquiries yet.</p>}
    </div>}
  </div>;
}