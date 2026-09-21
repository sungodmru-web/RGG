import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Check, Shield, Search, MoreHorizontal, UserX, ShieldAlert, Globe } from "lucide-react";
import { useAdministrators } from "@/hooks/use-admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminAdministrators() {
  const [search, setSearch] = useState("");
  const { data: administrators, isLoading } = useAdministrators();

  const filteredAdmins = administrators?.filter(admin =>
    admin.name.toLowerCase().includes(search.toLowerCase()) ||
    (admin.email && admin.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Administrators</h1>
          <p className="text-[#9AA79F] mt-1">Manage editorial team access and permissions.</p>
        </div>
        <div className="bg-[#162B1E] border border-[#1A2E20] px-4 py-2 rounded text-sm text-[#F4F1EA] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#C8A96B]" />
          <span>Managed via Clerk</span>
        </div>
      </div>

      <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1A2E20] flex flex-col md:flex-row gap-4 items-center bg-[#0B1510]/50">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718078]" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#080D09] border-[#1A2E20] text-[#F4F1EA] rounded-none w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A2E20] bg-[#0B1510]/80">
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden lg:table-cell">Last Sign In</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E20]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton className="h-5 w-48 mb-2 bg-[#213F2C]" />
                      <Skeleton className="h-3 w-32 bg-[#213F2C]" />
                    </td>
                    <td className="p-4"><Skeleton className="h-6 w-24 rounded-full bg-[#213F2C]" /></td>
                    <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-20 bg-[#213F2C]" /></td>
                    <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-32 bg-[#213F2C]" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-6 w-24 ml-auto rounded-full bg-[#213F2C]" /></td>
                  </tr>
                ))
              ) : filteredAdmins?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#9AA79F]">
                    No administrators found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAdmins?.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#1A2E20]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[#F4F1EA]">{admin.name}</div>
                      <div className="text-sm text-[#9AA79F] mt-1">{admin.email || "No email linked"}</div>
                      <div className="text-xs text-[#405246] mt-1 truncate max-w-[200px]" title={admin.clerkUserId || ""}>
                        {admin.clerkUserId ? `ID: ${admin.clerkUserId}` : "No Clerk ID"}
                      </div>
                    </td>
                    <td className="p-4">
                      {admin.accountStatus === "active" ? (
                        <Badge variant="outline" className="border-[#2E4738] text-[#86A391] bg-[#162B1E] uppercase text-[10px] tracking-wider rounded-none">Active</Badge>
                      ) : admin.accountStatus === "not_configured" ? (
                        <Badge variant="outline" className="border-[#4A4232] text-[#C8B383] bg-[#2A2314] uppercase text-[10px] tracking-wider rounded-none">Pending Setup</Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#4A2424] text-[#D97777] bg-[#2A1414] uppercase text-[10px] tracking-wider rounded-none">{admin.accountStatus}</Badge>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm">
                      {admin.role === "admin" ? (
                        <span className="flex items-center text-[#F4F1EA]"><Shield className="w-3 h-3 mr-2 text-[#C8A96B]" /> Administrator</span>
                      ) : (
                        <span className="text-[#9AA79F]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-[#9AA79F]">
                      {admin.lastSignInAt ? format(new Date(admin.lastSignInAt), "MMM d, yyyy h:mm a") : "Never"}
                    </td>
                    <td className="p-4 text-right">
                      {admin.accessStatus === "authorized" ? (
                        <Badge className="bg-[#0D3B2E] text-[#9AA79F] hover:bg-[#0D3B2E] border-none uppercase text-[10px] tracking-wider rounded-none">Authorized</Badge>
                      ) : admin.accessStatus === "pending_identity" ? (
                        <Badge className="bg-[#2A2314] text-[#C8B383] hover:bg-[#2A2314] border-none uppercase text-[10px] tracking-wider rounded-none">Pending Link</Badge>
                      ) : (
                        <Badge className="bg-[#2A1414] text-[#D97777] hover:bg-[#2A1414] border-none uppercase text-[10px] tracking-wider rounded-none">Unauthorized</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}