import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Search, Layers, Edit, Trash2, Check, X, ShieldAlert } from "lucide-react";
import { useAdminThemes, useCreateAdminTheme, useUpdateAdminTheme, useDeleteAdminTheme } from "@/hooks/use-admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const themeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  englishLabel: z.string().trim().min(1, "English label is required").max(160),
  frenchLabel: z.string().trim().min(1, "French label is required").max(160),
  description: z.string().max(2000).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

type ThemeFormValues = z.infer<typeof themeSchema>;

export default function AdminThemes() {
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: themes, isLoading } = useAdminThemes();
  const createTheme = useCreateAdminTheme();
  const updateTheme = useUpdateAdminTheme();
  const deleteTheme = useDeleteAdminTheme();

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      name: "",
      slug: "",
      englishLabel: "",
      frenchLabel: "",
      description: "",
      displayOrder: 0,
      active: true,
    },
  });

  const filteredThemes = themes?.filter(theme => 
    theme.name.toLowerCase().includes(search.toLowerCase()) || 
    theme.slug.toLowerCase().includes(search.toLowerCase()) ||
    theme.englishLabel.toLowerCase().includes(search.toLowerCase()) ||
    theme.frenchLabel.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = (values: ThemeFormValues) => {
    if (editingId) {
      updateTheme.mutate({ id: editingId, values }, {
        onSuccess: () => {
          toast({ title: "Theme updated successfully" });
          setEditingId(null);
          form.reset();
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Update failed", description: error.message });
        }
      });
    } else {
      createTheme.mutate(values, {
        onSuccess: () => {
          toast({ title: "Theme created successfully" });
          setOpenCreate(false);
          form.reset();
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Creation failed", description: error.message });
        }
      });
    }
  };

  const handleEdit = (theme: any) => {
    setEditingId(theme.id);
    form.reset({
      name: theme.name,
      slug: theme.slug,
      englishLabel: theme.englishLabel,
      frenchLabel: theme.frenchLabel,
      description: theme.description || "",
      displayOrder: theme.displayOrder || 0,
      active: theme.active ?? true,
    });
  };

  const handleDelete = (id: string, name: string) => {
    deleteTheme.mutate(id, {
      onSuccess: () => {
        toast({ title: "Theme archived", description: `${name} has been archived successfully.` });
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
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Publication Themes</h1>
          <p className="text-[#9AA79F] mt-1">Manage categories and tags used across publications.</p>
        </div>
        
        <Dialog open={openCreate} onOpenChange={(open) => {
          if (!open) form.reset();
          setOpenCreate(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none">
              <Plus className="mr-2 h-4 w-4" /> New Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#080D09] border-[#1A2E20] text-[#F4F1EA] rounded-none max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#C8A96B]">Create New Theme</DialogTitle>
              <DialogDescription className="text-[#9AA79F]">
                Themes are used to categorize publications on the public site.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F]">Internal Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Health & Safety" 
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
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
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F]">URL Slug</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. health-and-safety" 
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#D97777]" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="englishLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F]">English Display Label</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Health & Safety" 
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#D97777]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frenchLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F]">French Display Label</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Santé et Sécurité" 
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F]">Description (Internal)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          placeholder="Optional notes about when to use this theme" 
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#9AA79F]">Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field} 
                            className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-[#718078]">Lower numbers appear first</FormDescription>
                        <FormMessage className="text-[#D97777]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#1A2E20] bg-[#0B1510] p-4 mt-6">
                        <div className="space-y-0.5">
                          <FormLabel className="text-[#F4F1EA]">Active Status</FormLabel>
                          <FormDescription className="text-[#718078]">
                            Is this theme available for use?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant={field.value ? "default" : "outline"}
                              className={field.value ? "bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none" : "bg-transparent border-[#405246] text-[#9AA79F] hover:bg-[#162B1E] rounded-none"}
                              onClick={() => field.onChange(true)}
                            >
                              Active
                            </Button>
                            <Button
                              type="button"
                              variant={!field.value ? "default" : "outline"}
                              className={!field.value ? "bg-[#2A1414] text-[#D97777] hover:bg-[#3A1C1C] rounded-none border-none" : "bg-transparent border-[#405246] text-[#9AA79F] hover:bg-[#162B1E] rounded-none"}
                              onClick={() => field.onChange(false)}
                            >
                              Inactive
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="pt-4 border-t border-[#1A2E20]">
                  <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)} className="text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTheme.isPending} className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none">
                    {createTheme.isPending ? "Creating..." : "Create Theme"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="bg-[#080D09] border-[#1A2E20] text-[#F4F1EA] rounded-none max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#C8A96B]">Edit Theme</DialogTitle>
            <DialogDescription className="text-[#9AA79F]">
              Update category details. Note that changing the slug may break existing links.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F]">Internal Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F]">URL Slug</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="englishLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F]">English Display Label</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frenchLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F]">French Display Label</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#9AA79F]">Description (Internal)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""} 
                        className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                      />
                    </FormControl>
                    <FormMessage className="text-[#D97777]" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#9AA79F]">Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field} 
                          className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none focus-visible:ring-[#C8A96B]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#D97777]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#1A2E20] bg-[#0B1510] p-4 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[#F4F1EA]">Active Status</FormLabel>
                        <FormDescription className="text-[#718078]">
                          Is this theme available for use?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            className={field.value ? "bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none" : "bg-transparent border-[#405246] text-[#9AA79F] hover:bg-[#162B1E] rounded-none"}
                            onClick={() => field.onChange(true)}
                          >
                            Active
                          </Button>
                          <Button
                            type="button"
                            variant={!field.value ? "default" : "outline"}
                            className={!field.value ? "bg-[#2A1414] text-[#D97777] hover:bg-[#3A1C1C] rounded-none border-none" : "bg-transparent border-[#405246] text-[#9AA79F] hover:bg-[#162B1E] rounded-none"}
                            onClick={() => field.onChange(false)}
                          >
                            Inactive
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4 border-t border-[#1A2E20]">
                <Button type="button" variant="ghost" onClick={() => setEditingId(null)} className="text-[#9AA79F] hover:text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTheme.isPending} className="bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none">
                  {updateTheme.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1A2E20] flex flex-col md:flex-row gap-4 items-center bg-[#0B1510]/50">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718078]" />
            <Input 
              placeholder="Search themes..." 
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
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">Internal Name</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider">URL Slug</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden md:table-cell">Display Labels</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider hidden lg:table-cell w-[80px]">Order</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider w-[100px]">Status</th>
                <th className="p-4 text-xs font-semibold text-[#9AA79F] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E20]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton className="h-5 w-48 mb-2 bg-[#213F2C]" />
                      <Skeleton className="h-3 w-64 bg-[#213F2C]" />
                    </td>
                    <td className="p-4"><Skeleton className="h-4 w-32 bg-[#213F2C]" /></td>
                    <td className="p-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-32 mb-1 bg-[#213F2C]" />
                      <Skeleton className="h-4 w-32 bg-[#213F2C]" />
                    </td>
                    <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-8 bg-[#213F2C]" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16 rounded-full bg-[#213F2C]" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-8 w-20 ml-auto bg-[#213F2C]" /></td>
                  </tr>
                ))
              ) : filteredThemes?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#9AA79F]">
                    No themes found.
                  </td>
                </tr>
              ) : (
                filteredThemes?.map((theme) => (
                  <tr key={theme.id} className="hover:bg-[#1A2E20]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[#F4F1EA]">{theme.name}</div>
                      {theme.description && (
                        <div className="text-xs text-[#9AA79F] mt-1 truncate max-w-[200px] xl:max-w-md">{theme.description}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[#C8A96B] font-mono bg-[#0B1510] border border-[#1A2E20] inline-block px-2 py-1 rounded-sm">
                        {theme.slug}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm">
                      <div className="text-[#F4F1EA]">EN: {theme.englishLabel}</div>
                      <div className="text-[#F4F1EA] mt-1">FR: {theme.frenchLabel}</div>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-[#9AA79F]">
                      {theme.displayOrder}
                    </td>
                    <td className="p-4">
                      {theme.active ? (
                        <Badge variant="outline" className="border-[#2E4738] text-[#86A391] bg-[#162B1E] uppercase text-[10px] tracking-wider rounded-none">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#4A4232] text-[#C8B383] bg-[#2A2314] uppercase text-[10px] tracking-wider rounded-none">Archived</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(theme)}
                          title="Edit Theme"
                          className="h-8 w-8 text-[#9AA79F] hover:text-[#C8A96B] hover:bg-[#1A2E20]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Archive Theme"
                              className="h-8 w-8 text-[#D97777] hover:text-white hover:bg-[#D97777]/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#0B1510] border-[#1A2E20] text-[#F4F1EA] rounded-none">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Archive Theme?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#9AA79F]">
                                This will archive the "{theme.name}" theme. It will no longer appear as an option for new publications, but existing publications will retain their association.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-[#405246] text-[#F4F1EA] hover:bg-[#162B1E] rounded-none">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(theme.id, theme.name)}
                                className="bg-[#D97777] text-white hover:bg-[#b55e5e] rounded-none"
                              >
                                Archive
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