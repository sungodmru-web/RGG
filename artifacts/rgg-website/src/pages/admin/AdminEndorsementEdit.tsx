import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Upload, X, Eye, Trash2, CheckCircle } from "lucide-react";
import {
  useAdminEndorsement,
  useUpdateAdminEndorsement,
  useDeleteAdminEndorsement,
  useApproveAdminEndorsement
} from "@/hooks/use-admin-api";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const endorsementSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().optional().nullable(),
  organization: z.string().trim().optional().nullable(),
  quote: z.string().trim().min(1, "Quote is required"),
  photoMediaId: z.string().optional().nullable(),
  sourceUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  language: z.enum(["english", "french", "bilingual"]).default("english"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  verificationNote: z.string().optional().nullable(),
  status: z.enum(["draft", "approved", "archived"]).default("draft"),
});

type EndorsementFormValues = z.infer<typeof endorsementSchema>;

export default function AdminEndorsementEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: endorsement, isLoading: isLoadingEndorsement } = useAdminEndorsement(id);
  const updateEndorsement = useUpdateAdminEndorsement();
  const approveEndorsement = useApproveAdminEndorsement();
  const deleteEndorsement = useDeleteAdminEndorsement();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmVerification, setConfirmVerification] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const { uploadFile, isUploading, progress, triggerUpload, fileInputRef } = useMediaUpload({
    purpose: "endorsement-portrait",
    onSuccess: (media) => {
      form.setValue("photoMediaId", media.id, { shouldDirty: true });
      setPhotoPreview(`/api/media/${media.id}`);
    }
  });

  const form = useForm<EndorsementFormValues>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      name: "",
      title: "",
      organization: "",
      quote: "",
      photoMediaId: null,
      sourceUrl: "",
      language: "english",
      displayOrder: 0,
      verificationNote: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (endorsement) {
      form.reset({
        name: endorsement.name,
        title: endorsement.title || "",
        organization: endorsement.organization || "",
        quote: endorsement.quote,
        photoMediaId: (endorsement as any).photoMediaId || null,
        sourceUrl: endorsement.sourceUrl || "",
        language: (endorsement as any).language || "english",
        displayOrder: endorsement.displayOrder || 0,
        verificationNote: (endorsement as any).verificationNote || "",
        status: endorsement.status || "draft",
      });

      if ((endorsement as any).photoMediaId) {
        setPhotoPreview(`/api/media/${(endorsement as any).photoMediaId}`);
      }
    }
  }, [endorsement, form]);

  useEffect(() => {
    const subscription = form.watch(() => setHasUnsavedChanges(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = (values: EndorsementFormValues) => {
    if (!id) return;

    // Convert empty strings to null for optional fields
    const cleanedValues = {
      ...values,
      title: values.title || null,
      organization: values.organization || null,
      sourceUrl: values.sourceUrl || null,
      verificationNote: values.verificationNote || null,
    };

    updateEndorsement.mutate({ id, values: cleanedValues as any }, {
      onSuccess: () => {
        toast({ title: "Endorsement updated successfully" });
        form.reset(values); // Reset dirty state
        setHasUnsavedChanges(false);
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Failed to update", description: error.message });
      }
    });
  };

  const handleApprove = () => {
    if (!id || !confirmVerification) return;

    approveEndorsement.mutate(id, {
      onSuccess: () => {
        toast({ title: "Endorsement approved", description: "It is now visible on the public website." });
        setApprovalDialogOpen(false);
        setConfirmVerification(false);
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Failed to approve", description: error.message });
      }
    });
  };

  const handleArchive = () => {
    if (!id) return;

    deleteEndorsement.mutate(id, {
      onSuccess: () => {
        toast({ title: "Endorsement archived", description: "It has been removed from the public website." });
        setLocation("/admin/endorsements");
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Archive failed", description: error.message });
      }
    });
  };

  const removePhoto = () => {
    form.setValue("photoMediaId", null, { shouldDirty: true });
    setPhotoPreview(null);
  };

  if (isLoadingEndorsement) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <Skeleton className="h-4 w-32 bg-[#162B1E]" />
        <Skeleton className="h-10 w-64 bg-[#162B1E]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Skeleton className="h-[400px] w-full bg-[#162B1E] rounded-lg" />
            <Skeleton className="h-[200px] w-full bg-[#162B1E] rounded-lg" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full bg-[#162B1E] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!endorsement) {
    return (
      <div className="container mx-auto p-12 max-w-4xl text-center">
        <h2 className="text-2xl font-serif text-[#F4F1EA] mb-4">Endorsement not found</h2>
        <Link href="/admin/endorsements">
          <Button variant="outline" className="border-[#C8A96B] text-[#C8A96B] hover:bg-[#162B1E]">
            Return to Endorsements
          </Button>
        </Link>
      </div>
    );
  }

  const isApproved = endorsement.status === "approved";

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex justify-between items-center gap-4 text-sm text-[#9AA79F] mb-2">
        <Link href="/admin/endorsements" className="hover:text-[#F4F1EA] flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Endorsements
        </Link>
        {hasUnsavedChanges && (
          <span className="text-[#C8A96B] text-xs uppercase tracking-wider">Unsaved Changes</span>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Edit Endorsement</h1>
          <p className="text-[#9AA79F] mt-1">{endorsement.name}</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {isApproved ? (
            <Badge variant="outline" className="border-[#2E4738] text-[#86A391] bg-[#162B1E] uppercase text-[10px] tracking-wider rounded-none px-3 py-1">
              Approved (Public)
            </Badge>
          ) : endorsement.status === "draft" ? (
            <Badge variant="outline" className="border-[#4A4232] text-[#C8B383] bg-[#2A2314] uppercase text-[10px] tracking-wider rounded-none px-3 py-1">
              Draft
            </Badge>
          ) : (
            <Badge variant="outline" className="border-[#4A2424] text-[#D97777] bg-[#2A1414] uppercase text-[10px] tracking-wider rounded-none px-3 py-1">
              Archived
            </Badge>
          )}

          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateEndorsement.isPending || isUploading || !hasUnsavedChanges}
            variant={hasUnsavedChanges ? "default" : "outline"}
            className={hasUnsavedChanges
              ? "bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none shadow-[0_0_15px_rgba(200,169,107,0.2)] transition-all"
              : "bg-transparent border-[#405246] text-[#9AA79F] rounded-none"
            }
          >
            {updateEndorsement.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> {hasUnsavedChanges ? "Save Changes" : "Saved"}</>
            )}
          </Button>

          {!isApproved && endorsement.status !== "archived" && (
            <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0D3B2E] text-[#9AA79F] hover:bg-[#16503E] hover:text-[#F4F1EA] rounded-none">
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#080D09] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-[#C8A96B]">Approve Endorsement</DialogTitle>
                  <DialogDescription className="text-[#9AA79F]">
                    Approving this endorsement will make it visible on the public website.
                  </DialogDescription>
                </DialogHeader>

                {hasUnsavedChanges && (
                  <div className="bg-[#2A2314] border border-[#4A4232] p-4 text-sm text-[#C8B383] mt-2">
                    You have unsaved changes. Please save them before approving.
                  </div>
                )}

                <div className="mt-4 p-4 border border-[#1A2E20] bg-[#0B1510] space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="verify"
                      checked={confirmVerification}
                      onCheckedChange={(checked) => setConfirmVerification(checked as boolean)}
                      className="mt-1 border-[#C8A96B] data-[state=checked]:bg-[#C8A96B] data-[state=checked]:text-[#07100A]"
                    />
                    <div className="space-y-1 leading-none">
                      <label htmlFor="verify" className="text-sm font-medium text-[#F4F1EA] cursor-pointer">
                        Authentication Confirmation
                      </label>
                      <p className="text-sm text-[#9AA79F]">
                        I confirm that this endorsement is authentic and authorized for publication.
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="ghost" onClick={() => setApprovalDialogOpen(false)} className="text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#1A2E20] rounded-none">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={!confirmVerification || approveEndorsement.isPending || hasUnsavedChanges}
                    className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none"
                  >
                    {approveEndorsement.isPending ? "Approving..." : "Approve & Publish"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {endorsement.status !== "archived" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="bg-transparent border-[#405246] text-[#D97777] hover:bg-[#2A1414] rounded-none">
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Endorsement?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#9AA79F]">
                    This will archive the endorsement from "{endorsement.name}".
                    {isApproved && " It will immediately be removed from the public website."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-[#405246] text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleArchive}
                    disabled={deleteEndorsement.isPending}
                    className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none"
                  >
                    {deleteEndorsement.isPending ? "Archiving..." : "Archive"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Main content */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Person & Quote</h2>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Name <span className="text-[#D97777]">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Dr. Jane Smith"
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B] text-lg"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Professional Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="e.g. Director of Policy"
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#D97777]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Organization / Institution</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="e.g. World Health Organization"
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#D97777]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="quote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Endorsement Quote <span className="text-[#D97777]">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter the full endorsement text here..."
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B] min-h-[150px] resize-y"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#718078]">
                        Do not include quotation marks; they will be added automatically on the public site.
                      </FormDescription>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Verification & Meta</h2>

                <FormField
                  control={form.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Source URL (Public)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="e.g. https://example.com/review"
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#718078]">
                        Optional link to the original publication or source of the quote.
                      </FormDescription>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verificationNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Verification Note (Private)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Notes on how this quote was verified or permission obtained..."
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B] min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#718078]">
                        Internal editorial notes. Never displayed publicly.
                      </FormDescription>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Settings & Media */}
            <div className="space-y-8">
              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6 sticky top-24">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Display Settings</h2>

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA]">
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="bilingual">Bilingual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#718078]">
                        Lower numbers appear first.
                      </FormDescription>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <div className="space-y-3 pt-4 border-t border-[#1A2E20]">
                  <div className="text-[#9AA79F] text-sm font-medium leading-none mb-2">Portrait Image</div>
                  <div className="relative border border-dashed border-[#1A2E20] bg-[#0B1510] rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Portrait preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="relative z-10 flex flex-col items-center gap-2 p-4 w-full h-full justify-center bg-black/40 backdrop-blur-[2px] transition-opacity opacity-0 hover:opacity-100">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removePhoto}
                            className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none w-full max-w-[120px]"
                          >
                            <X className="w-4 h-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center">
                        <ImageIcon className="w-8 h-8 text-[#405246] mx-auto mb-2" />
                        <p className="text-xs text-[#718078] mb-4">No image uploaded</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={triggerUpload}
                          disabled={isUploading}
                          className="bg-transparent border-[#C8A96B] text-[#C8A96B] hover:bg-[#C8A96B] hover:text-[#07100A] rounded-none"
                        >
                          {isUploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {progress}%</>
                          ) : (
                            <><Upload className="w-4 h-4 mr-2" /> Upload Portrait</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  {form.formState.errors.photoMediaId && (
                    <p className="text-sm text-[#D97777] mt-1">{form.formState.errors.photoMediaId.message}</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}