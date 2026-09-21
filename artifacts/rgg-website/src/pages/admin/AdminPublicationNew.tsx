import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, FileText, Image as ImageIcon, Upload, X, Check, Eye, Plus } from "lucide-react";
import { useCreateAdminPublication, useAdminThemes } from "@/hooks/use-admin-api";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { PublicationType } from "@/types/research";
import { PublicationRichTextEditor } from "@/components/admin/PublicationRichTextEditor";

const publicationSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  subtitle: z.string().optional().nullable(),
  abstract: z.string().trim().min(1, "Abstract is required"),
  content: z.string().optional().nullable(),
  publicationType: z.enum([
    "research-paper",
    "policy-brief",
    "article",
    "commentary",
    "report",
    "case-study",
  ] as const),
  themeId: z.string().optional().nullable(),
  language: z.enum(["english", "french", "bilingual"]).default("english"),
  authors: z.array(z.object({
    name: z.string().min(1),
    role: z.string().optional(),
  })).min(1, "At least one author is required"),
  publicationDate: z.string().optional().nullable(),
  readingTime: z.coerce.number().int().min(1).optional().nullable(),
  featured: z.boolean().default(false),
  pdfMediaId: z.string().optional().nullable(),
  featuredImageMediaId: z.string().optional().nullable(),
  externalUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  doi: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

type PublicationFormValues = z.infer<typeof publicationSchema>;

export default function AdminPublicationNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createPublication = useCreateAdminPublication();
  const { data: themes } = useAdminThemes();

  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const pdfUpload = useMediaUpload({
    purpose: "publication-pdf",
    onSuccess: (media) => {
      form.setValue("pdfMediaId", media.id, { shouldDirty: true });
      setPdfPreview(media.originalFilename);
    }
  });

  const imageUpload = useMediaUpload({
    purpose: "publication-image",
    onSuccess: (media) => {
      form.setValue("featuredImageMediaId", media.id, { shouldDirty: true });
      setImagePreview(`/api/media/${media.id}`);
    }
  });

  const form = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: "",
      slug: "",
      subtitle: "",
      abstract: "",
      content: "",
      publicationType: "article",
      themeId: null,
      language: "english",
      authors: [{ name: "" }],
      publicationDate: "",
      readingTime: null,
      featured: false,
      pdfMediaId: null,
      featuredImageMediaId: null,
      externalUrl: "",
      doi: "",
      seoTitle: "",
      seoDescription: "",
      status: "draft",
    },
  });

  const onSubmit = (values: PublicationFormValues) => {
    // Clean up empty strings
    const cleanedValues = {
      ...values,
      subtitle: values.subtitle || null,
      content: values.content || null,
      themeId: values.themeId || null,
      publicationDate: values.publicationDate || null,
      externalUrl: values.externalUrl || null,
      doi: values.doi || null,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    };

    createPublication.mutate(cleanedValues as any, {
      onSuccess: (data) => {
        toast({ title: "Publication created successfully" });
        setLocation(`/admin/publications/${data.id}`);
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Failed to create", description: error.message });
      }
    });
  };

  const removePdf = () => {
    form.setValue("pdfMediaId", null, { shouldDirty: true });
    setPdfPreview(null);
  };

  const removeImage = () => {
    form.setValue("featuredImageMediaId", null, { shouldDirty: true });
    setImagePreview(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex justify-between items-center gap-4 text-sm text-[#9AA79F] mb-2">
        <Link href="/admin/publications" className="hover:text-[#F4F1EA] flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Publications
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">New Publication</h1>
          <p className="text-[#9AA79F] mt-1">Create a new article, report, or document.</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <Badge variant="outline" className="border-[#4A4232] text-[#C8B383] bg-[#2A2314] uppercase text-[10px] tracking-wider rounded-none px-3 py-1">
            Draft
          </Badge>

          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createPublication.isPending || pdfUpload.isUploading || imageUpload.isUploading}
            className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none shadow-[0_0_15px_rgba(200,169,107,0.2)] transition-all"
          >
            {createPublication.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Draft</>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Main content */}
            <div className="lg:col-span-2 space-y-8">

              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Basic Information</h2>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Title <span className="text-[#D97777]">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Publication title"
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B] text-lg"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!form.getValues("slug")) {
                              form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">URL Slug <span className="text-[#D97777]">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. cannabis-governance-framework"
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#D97777]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Optional subtitle"
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
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Abstract / Summary <span className="text-[#D97777]">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief summary of the publication..."
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B] min-h-[120px] resize-y"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#718078]">
                        Appears on listing pages and at the beginning of the article.
                      </FormDescription>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Full Content</h2>
                <div className="text-sm text-[#718078] mb-2">
                  Content is optional if you are uploading a PDF document.
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] sr-only text-sm font-medium leading-none">Article Content</FormLabel>
                      <FormControl>
                        <PublicationRichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Authors</h2>

                <div className="space-y-4">
                  {form.watch("authors").map((_, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`authors.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={index > 0 ? "sr-only" : "text-[#9AA79F]"}>Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Author Name"
                                className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                              />
                            </FormControl>
                            <FormMessage className="text-[#D97777]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`authors.${index}.role`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={index > 0 ? "sr-only" : "text-[#9AA79F]"}>Role (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="e.g. Lead Researcher"
                                className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-1 text-[#D97777] hover:bg-[#2A1414] rounded-none shrink-0"
                          onClick={() => {
                            const authors = form.getValues("authors");
                            form.setValue("authors", authors.filter((_, i) => i !== index), { shouldDirty: true });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-transparent border-[#405246] text-[#C8A96B] hover:bg-[#1A2E20] rounded-none w-full"
                    onClick={() => {
                      const authors = form.getValues("authors");
                      form.setValue("authors", [...authors, { name: "", role: "" }], { shouldDirty: true });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Author
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Settings & Media */}
            <div className="space-y-8">
              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Settings</h2>

                <FormField
                  control={form.control}
                  name="publicationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA]">
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="research-paper">Research Paper</SelectItem>
                          <SelectItem value="policy-brief">Policy Brief</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="commentary">Commentary</SelectItem>
                          <SelectItem value="case-study">Case Study</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="themeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Theme</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                        defaultValue={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA]">
                          <SelectItem value="none">None</SelectItem>
                          {themes?.filter(t => t.active).map(theme => (
                            <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="publicationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F] text-sm font-medium leading-none">Publication Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#1A2E20] bg-[#0B1510] p-4 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[#F4F1EA] text-sm font-medium leading-none">Featured</FormLabel>
                        <FormDescription className="text-[#718078]">
                          Highlight on the home page.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#C8A96B]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#162B1E] border border-[#1A2E20] p-6 rounded-lg space-y-6">
                <h2 className="font-serif text-xl text-[#C8A96B] border-b border-[#1A2E20] pb-2">Media & Attachments</h2>

                <div className="space-y-3">
                  <div className="text-[#9AA79F] text-sm font-medium leading-none mb-2">PDF Document</div>
                  <div className="relative border border-dashed border-[#1A2E20] bg-[#0B1510] rounded-lg overflow-hidden flex flex-col items-center justify-center p-6">
                    {pdfPreview ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="w-12 h-12 bg-[#1A2E20] rounded flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-[#C8A96B]" />
                        </div>
                        <p className="text-sm text-[#F4F1EA] font-medium truncate w-full text-center px-4" title={pdfPreview}>{pdfPreview}</p>
                        <p className="text-xs text-[#86A391] mt-1 mb-4 flex items-center"><Check className="w-3 h-3 mr-1" /> PDF Attached</p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removePdf}
                          className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none"
                        >
                          <X className="w-4 h-4 mr-2" /> Remove PDF
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center w-full">
                        <FileText className="w-8 h-8 text-[#405246] mx-auto mb-2" />
                        <p className="text-xs text-[#718078] mb-4">Upload a PDF publication</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={pdfUpload.triggerUpload}
                          disabled={pdfUpload.isUploading}
                          className="bg-transparent border-[#C8A96B] text-[#C8A96B] hover:bg-[#C8A96B] hover:text-[#07100A] rounded-none w-full"
                        >
                          {pdfUpload.isUploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {pdfUpload.progress}%</>
                          ) : (
                            <><Upload className="w-4 h-4 mr-2" /> Select PDF</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={pdfUpload.fileInputRef}
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        pdfUpload.uploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  {form.formState.errors.pdfMediaId && (
                    <p className="text-sm text-[#D97777] mt-1">{form.formState.errors.pdfMediaId.message}</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-[#1A2E20]">
                  <div className="text-[#9AA79F] text-sm font-medium leading-none mb-2">Featured Image</div>
                  <div className="relative border border-dashed border-[#1A2E20] bg-[#0B1510] rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Featured preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="relative z-10 flex flex-col items-center gap-2 p-4 w-full h-full justify-center bg-black/40 backdrop-blur-[2px] transition-opacity opacity-0 hover:opacity-100">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeImage}
                            className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none w-full max-w-[120px]"
                          >
                            <X className="w-4 h-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center w-full">
                        <ImageIcon className="w-8 h-8 text-[#405246] mx-auto mb-2" />
                        <p className="text-xs text-[#718078] mb-4">No image uploaded</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={imageUpload.triggerUpload}
                          disabled={imageUpload.isUploading}
                          className="bg-transparent border-[#C8A96B] text-[#C8A96B] hover:bg-[#C8A96B] hover:text-[#07100A] rounded-none w-full"
                        >
                          {imageUpload.isUploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {imageUpload.progress}%</>
                          ) : (
                            <><Upload className="w-4 h-4 mr-2" /> Upload Image</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={imageUpload.fileInputRef}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        imageUpload.uploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  {form.formState.errors.featuredImageMediaId && (
                    <p className="text-sm text-[#D97777] mt-1">{form.formState.errors.featuredImageMediaId.message}</p>
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