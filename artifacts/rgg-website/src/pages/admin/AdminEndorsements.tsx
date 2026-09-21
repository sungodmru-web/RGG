import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Search, Award, Edit, Trash2, Eye } from "lucide-react";
import { useAdminEndorsements, useDeleteAdminEndorsement } from "@/hooks/use-admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminEndorsements() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: endorsements, isLoading } = useAdminEndorsements();
  const deleteEndorsement = useDeleteAdminEndorsement();

  const filteredEndorsements = endorsements?.filter(endorsement => {
    const matchesSearch =
      endorsement.name.toLowerCase().includes(search.toLowerCase()) ||
      (endorsement.organization && endorsement.organization.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || endorsement.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === "draft") return -1;
      if (b.status === "draft") return 1;
      if (a.status === "approved") return -1;
      if (b.status === "approved") return 1;
    }
    return a.displayOrder - b.displayOrder;
  });

  const handleDelete = (id: string, name: string) => {
    deleteEndorsement.mutate(id, {
      onSuccess: () => {
        toast({ title: "Endorsement archived", description: `${name} has been archived successfully.` });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Archive failed", description: error.message });
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Endorsements</h1>
          <p className="text-[#9AA79F] mt-1">Manage public support and testimonials.</p>
        </div>
        <div>
          <Link href="/admin/endorsements/new">
            <Button className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none">
              <Plus className="mr-2 h-4 w-4" /> New Endorsement
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1A2E20] flex flex-col md:flex-row gap-4 items-center bg-[#0B1510]/50">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718078]" />
            <Input
              placeholder="Search by name or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#080D09] border-[#1A2E20] text-[#F4F1EA] rounded-none w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-[#080D09] border-[#1A2E20] rounded-none">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A2E20] bg-[#0B1510]/80">
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">Person & Org</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden md:table-cell">Quote</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden lg:table-cell w-[100px]">Lang / Order</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider w-[100px]">Status</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E20]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton className="h-5 w-48 mb-2 bg-[#213F2C]" />
                      <Skeleton className="h-3 w-32 bg-[#213F2C]" />
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-full mb-1 bg-[#213F2C]" />
                      <Skeleton className="h-4 w-3/4 bg-[#213F2C]" />
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Skeleton className="h-4 w-12 mb-1 bg-[#213F2C]" />
                      <Skeleton className="h-4 w-8 bg-[#213F2C]" />
                    </td>
                    <td className="p-4"><Skeleton className="h-6 w-16 rounded-full bg-[#213F2C]" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto bg-[#213F2C]" /></td>
                  </tr>
                ))
              ) : filteredEndorsements?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#9AA79F]">
                    No endorsements found.
                  </td>
                </tr>
              ) : (
                filteredEndorsements?.map((endorsement: any) => (
                  <tr key={endorsement.id} className="hover:bg-[#1A2E20]/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[#080D09] border border-[#1A2E20] overflow-hidden flex items-center justify-center">
                          {endorsement.photoMediaId ? (
                            <img
                              src={`/api/media/${endorsement.photoMediaId}`}
                              alt={endorsement.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Award className="h-5 w-5 text-[#405246]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#F4F1EA]">{endorsement.name}</div>
                          <div className="text-xs text-[#9AA79F] truncate max-w-[200px] xl:max-w-[300px]">
                            {endorsement.title}{endorsement.title && endorsement.organization ? ' at ' : ''}{endorsement.organization}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="text-sm text-[#F4F1EA] italic line-clamp-2 max-w-md xl:max-w-lg">
                        "{endorsement.quote}"
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="text-xs text-[#F4F1EA] uppercase">{endorsement.language || "EN"}</div>
                      <div className="text-xs text-[#9AA79F] mt-1">Order: {endorsement.displayOrder}</div>
                    </td>
                    <td className="p-4">
                      {endorsement.status === "approved" ? (
                        <Badge variant="outline" className="border-[#2E4738] text-[#86A391] bg-[#162B1E] uppercase text-[10px] tracking-wider rounded-none">Approved</Badge>
                      ) : endorsement.status === "draft" ? (
                        <Badge variant="outline" className="border-[#4A4232] text-[#C8B383] bg-[#2A2314] uppercase text-[10px] tracking-wider rounded-none">Draft</Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#4A2424] text-[#D97777] bg-[#2A1414] uppercase text-[10px] tracking-wider rounded-none">Archived</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {endorsement.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View on public site"
                            className="h-8 w-8 text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#1A2E20]"
                          >
                            <a href="/endorsements" target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Link href={`/admin/endorsements/${endorsement.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            className="h-8 w-8 text-[#9AA79F] hover:text-[#C8A96B] hover:bg-[#1A2E20]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {endorsement.status !== "archived" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Archive"
                                className="h-8 w-8 text-[#D97777] hover:text-white hover:bg-[#D97777]/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive Endorsement?</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#9AA79F]">
                                  This will archive the endorsement from "{endorsement.name}". It will immediately be removed from the public website if currently approved.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-[#405246] text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(endorsement.id, endorsement.name)}
                                  className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none"
                                >
                                  Archive
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
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