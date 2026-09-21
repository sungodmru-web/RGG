import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Search, BookOpen, Edit, Trash2, Eye } from "lucide-react";
import { useAdminPublications, useAdminThemes, useDeleteAdminPublication } from "@/hooks/use-admin-api";
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

export default function AdminPublications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: publications, isLoading } = useAdminPublications();
  const { data: themes } = useAdminThemes();
  const deletePublication = useDeleteAdminPublication();

  const filteredPublications = publications?.filter(pub => {
    const matchesSearch =
      pub.title.toLowerCase().includes(search.toLowerCase()) ||
      pub.slug.toLowerCase().includes(search.toLowerCase()) ||
      pub.authors?.some(a => a.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || pub.status === statusFilter;
    const matchesType = typeFilter === "all" || pub.publicationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getThemeName = (themeId?: string | null) => {
    if (!themeId || !themes) return "None";
    const theme = themes.find(t => t.id === themeId);
    return theme ? theme.name : "Unknown Theme";
  };

  const handleDelete = (id: string, title: string) => {
    deletePublication.mutate(id, {
      onSuccess: () => {
        toast({ title: "Publication deleted", description: `"${title}" has been deleted successfully.` });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Deletion failed", description: error.message });
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Publications</h1>
          <p className="text-[#9AA79F] mt-1">Manage articles, research papers, and documents.</p>
        </div>
        <div>
          <Link href="/admin/publications/new">
            <Button className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none">
              <Plus className="mr-2 h-4 w-4" /> New Publication
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1A2E20] flex flex-col md:flex-row gap-4 items-center bg-[#0B1510]/50">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718078]" />
            <Input
              placeholder="Search title, author, or slug..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-[#080D09] border-[#1A2E20] rounded-none">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA]">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="research-paper">Research Paper</SelectItem>
                <SelectItem value="policy-brief">Policy Brief</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="commentary">Commentary</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A2E20] bg-[#0B1510]/80">
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">Title & Authors</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden md:table-cell">Type & Theme</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden lg:table-cell">Last Updated</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider w-[100px]">Status</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E20]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton className="h-5 w-64 mb-2 bg-[#213F2C]" />
                      <Skeleton className="h-3 w-32 bg-[#213F2C]" />
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-24 mb-1 bg-[#213F2C]" />
                      <Skeleton className="h-4 w-20 bg-[#213F2C]" />
                    </td>
                    <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-24 bg-[#213F2C]" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16 rounded-full bg-[#213F2C]" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto bg-[#213F2C]" /></td>
                  </tr>
                ))
              ) : filteredPublications?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#9AA79F]">
                    No publications found.
                  </td>
                </tr>
              ) : (
                filteredPublications?.map((pub) => (
                  <tr key={pub.id} className="hover:bg-[#1A2E20]/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 text-[#C8A96B]">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[#F4F1EA] line-clamp-1 max-w-[200px] sm:max-w-xs xl:max-w-md" title={pub.title}>{pub.title}</div>
                          <div className="text-xs text-[#9AA79F] mt-1 truncate max-w-[200px] sm:max-w-xs xl:max-w-md">
                            By {pub.authors?.map((author) => author.name).join(", ") || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="text-sm text-[#F4F1EA] capitalize">{pub.publicationType.replace("-", " ")}</div>
                      <div className="text-xs text-[#9AA79F] mt-1">{getThemeName(pub.themeId)}</div>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-[#9AA79F]">
                      {format(new Date(pub.updatedAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4">
                      {pub.status === "published" ? (
                        <Badge variant="outline" className="border-[#2E4738] text-[#86A391] bg-[#162B1E] uppercase text-[10px] tracking-wider rounded-none">Published</Badge>
                      ) : pub.status === "draft" ? (
                        <Badge variant="outline" className="border-[#4A4232] text-[#C8B383] bg-[#2A2314] uppercase text-[10px] tracking-wider rounded-none">Draft</Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#4A2424] text-[#D97777] bg-[#2A1414] uppercase text-[10px] tracking-wider rounded-none">Archived</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pub.status === "published" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View live"
                             aria-label={`View ${pub.title} live`}
                            className="h-8 w-8 text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#1A2E20]"
                          >
                            <a href={`/publications/${pub.slug}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Link href={`/admin/publications/${pub.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                             aria-label={`Edit ${pub.title}`}
                            className="h-8 w-8 text-[#9AA79F] hover:text-[#C8A96B] hover:bg-[#1A2E20]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {pub.status === "archived" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Permanently"
                                 aria-label={`Delete ${pub.title} permanently`}
                                className="h-8 w-8 text-[#D97777] hover:text-white hover:bg-[#D97777]/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#D97777]">Delete Permanently?</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#9AA79F]">
                                  This will permanently delete "{pub.title}" and cannot be undone. Associated media files will not be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-[#405246] text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pub.id, pub.title)}
                                  className="bg-red-700 text-white hover:bg-red-800 rounded-none"
                                >
                                  Delete Permanently
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