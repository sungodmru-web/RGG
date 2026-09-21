import { useState } from "react";
import { format } from "date-fns";
import { Search, Plus, FileText, Image as ImageIcon, Copy, Trash2, Loader2, Eye } from "lucide-react";
import { useAdminMedia, useDeleteAdminMedia } from "@/hooks/use-admin-api";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
export default function AdminMedia() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "pdf" | "image">("all");
  const { toast } = useToast();
  
  const { data: media, isLoading, refetch } = useAdminMedia(
    type === "all" ? undefined : type,
    search || undefined
  );
  
  const deleteMedia = useDeleteAdminMedia();
  
  const { uploadFile, isUploading, progress, fileInputRef, triggerUpload } = useMediaUpload({
    purpose: "general",
    onSuccess: () => refetch()
  });

  const handleDelete = (id: string) => {
    deleteMedia.mutate(id, {
      onSuccess: () => {
        toast({ title: "Media deleted successfully" });
      },
      onError: (error) => {
        toast({ 
          variant: "destructive", 
          title: "Delete failed", 
          description: error.message 
        });
      }
    });
  };

  const copyReference = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "ID copied to clipboard", description: id });
  };

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Media Library</h1>
          <p className="text-[#9AA79F] mt-1">Manage documents, publications PDFs, and imagery.</p>
        </div>
        <div>
          <input 
            id="admin-media-upload"
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            aria-label="Choose media to upload"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.avif"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                uploadFile(e.target.files[0]);
              }
            }}
          />
          <Button 
            onClick={triggerUpload} 
            disabled={isUploading}
            className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none"
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading {progress}%</>
            ) : (
              <><Plus className="mr-2 h-4 w-4" /> Upload Media</>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1A2E20] flex flex-col md:flex-row gap-4 items-center bg-[#0B1510]/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718078]" />
            <Input 
              placeholder="Search media by filename..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#080D09] border-[#1A2E20] text-[#F4F1EA] rounded-none w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={type} onValueChange={(value: "all" | "pdf" | "image") => setType(value)}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#080D09] border-[#1A2E20] rounded-none">
                <SelectValue placeholder="All Media" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA]">
                <SelectItem value="all">All Media</SelectItem>
                <SelectItem value="pdf">PDF Documents</SelectItem>
                <SelectItem value="image">Images</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A2E20] bg-[#0B1510]/80">
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider w-[60px]">Type</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">Filename</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden md:table-cell">Size</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden md:table-cell">Upload Date</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E20]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-10 w-10 bg-[#213F2C]" /></td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-48 mb-2 bg-[#213F2C]" />
                      <Skeleton className="h-3 w-32 bg-[#213F2C]" />
                    </td>
                    <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-16 bg-[#213F2C]" /></td>
                    <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-24 bg-[#213F2C]" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto bg-[#213F2C]" /></td>
                  </tr>
                ))
              ) : media?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#9AA79F]">
                    No media found.
                  </td>
                </tr>
              ) : (
                media?.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1A2E20]/30 transition-colors">
                    <td className="p-4">
                      <div className="h-10 w-10 rounded bg-[#080D09] border border-[#1A2E20] flex items-center justify-center text-[#C8A96B]">
                        {item.mediaType === "pdf" ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#F4F1EA] truncate max-w-[200px] sm:max-w-xs md:max-w-md">{item.originalFilename}</div>
                      <div className="text-xs text-[#9AA79F] truncate max-w-[200px] sm:max-w-xs md:max-w-md">{item.id}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-[#9AA79F]">
                      {formatBytes(item.fileSize)}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-[#9AA79F]">
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyReference(item.id)}
                          title="Copy ID"
                           aria-label={`Copy ID for ${item.originalFilename}`}
                          className="h-8 w-8 text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#1A2E20]"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          asChild
                          title="Preview"
                          aria-label={`Preview ${item.originalFilename}`}
                          className="h-8 w-8 text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#1A2E20]"
                        >
                          <a href={`/api/media/${item.id}`} target="_blank" rel="noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete"
                             aria-label={`Delete ${item.originalFilename}`}
                              className="h-8 w-8 text-[#D97777] hover:text-white hover:bg-[#D97777]/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#9AA79F]">
                                This will permanently delete "{item.originalFilename}". This action cannot be undone.
                                If this file is currently attached to a publication or endorsement, the deletion will fail.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-[#405246] text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item.id)}
                                className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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