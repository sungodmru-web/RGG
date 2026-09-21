import { Link } from "wouter";
import { format } from "date-fns";
import {
  FileText,
  Settings,
  Users,
  LogOut,
  Image as ImageIcon,
  Library,
  Layers,
  Award,
  BookOpen,
  Mail,
} from "lucide-react";
import { useAdminActivity, useAdminPublications, useAdministrators, useAdminEndorsements, useAdminMedia, useAdminEnquiries } from "@/hooks/use-admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  const { data: activity, isLoading: loadingActivity } = useAdminActivity();
  const { data: publications, isLoading: loadingPublications } = useAdminPublications();
  const { data: endorsements, isLoading: loadingEndorsements } = useAdminEndorsements();
  const { data: media, isLoading: loadingMedia } = useAdminMedia();
  const { data: enquiries, isLoading: loadingEnquiries } = useAdminEnquiries();

  const publishedCount = publications?.filter(p => p.status === "published").length ?? 0;
  const draftCount = publications?.filter(p => p.status === "draft").length ?? 0;

  const approvedEndorsements = endorsements?.filter(e => e.status === "approved").length ?? 0;
  const draftEndorsements = endorsements?.filter(e => e.status === "draft").length ?? 0;

  const pdfCount = media?.filter(m => m.mediaType === "pdf").length ?? 0;
  const imageCount = media?.filter(m => m.mediaType === "image").length ?? 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#F4F1EA]">Editorial Dashboard</h1>
          <p className="text-[#9AA79F] mt-1">Manage publications, themes, media, and endorsements.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/publications/new" className="inline-flex h-9 items-center justify-center rounded-md bg-[#C8A96B] px-4 py-2 text-sm font-medium text-[#07100A] transition-colors hover:bg-[#EDD99A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <BookOpen className="mr-2 h-4 w-4" />
            New Publication
          </Link>
          <Link href="/admin/endorsements/new" className="inline-flex h-9 items-center justify-center rounded-md border border-[#405246] bg-transparent px-4 py-2 text-sm font-medium text-[#F4F1EA] shadow-sm transition-colors hover:bg-[#162B1E] hover:text-[#F4F1EA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <Award className="mr-2 h-4 w-4" />
            New Endorsement
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-[#162B1E] border border-[#1A2E20] p-5 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-[#9AA79F] uppercase tracking-wider">Publications</span>
            <BookOpen className="h-5 w-5 text-[#C8A96B]" />
          </div>
          <div className="mt-4">
            {loadingPublications ? (
              <Skeleton className="h-10 w-16 bg-[#213F2C]" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif text-[#F4F1EA]">{publishedCount}</span>
                <span className="text-sm text-[#9AA79F]">published</span>
              </div>
            )}
            <div className="text-xs text-[#9AA79F] mt-1">
              {loadingPublications ? <Skeleton className="h-4 w-24 bg-[#213F2C]" /> : `${draftCount} drafts`}
            </div>
          </div>
        </div>
        <Link href="/admin/enquiries" className="bg-[#162B1E] border border-[#1A2E20] p-5 rounded-lg flex flex-col justify-between hover:border-[#C8A96B]">
          <div className="flex justify-between items-start"><span className="text-sm font-medium text-[#9AA79F] uppercase tracking-wider">Enquiries</span><Mail className="h-5 w-5 text-[#C8A96B]" /></div>
          <div className="mt-4">{loadingEnquiries ? <Skeleton className="h-10 w-16 bg-[#213F2C]" /> : <div className="flex items-baseline gap-2"><span className="text-4xl font-serif text-[#F4F1EA]">{enquiries?.counts.new ?? 0}</span><span className="text-sm text-[#9AA79F]">new</span></div>}<div className="text-xs text-[#9AA79F] mt-1">Review website messages</div></div>
        </Link>

        <div className="bg-[#162B1E] border border-[#1A2E20] p-5 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-[#9AA79F] uppercase tracking-wider">Endorsements</span>
            <Award className="h-5 w-5 text-[#C8A96B]" />
          </div>
          <div className="mt-4">
            {loadingEndorsements ? (
              <Skeleton className="h-10 w-16 bg-[#213F2C]" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif text-[#F4F1EA]">{approvedEndorsements}</span>
                <span className="text-sm text-[#9AA79F]">approved</span>
              </div>
            )}
            <div className="text-xs text-[#9AA79F] mt-1">
              {loadingEndorsements ? <Skeleton className="h-4 w-24 bg-[#213F2C]" /> : `${draftEndorsements} drafts`}
            </div>
          </div>
        </div>

        <div className="bg-[#162B1E] border border-[#1A2E20] p-5 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-[#9AA79F] uppercase tracking-wider">Documents</span>
            <FileText className="h-5 w-5 text-[#C8A96B]" />
          </div>
          <div className="mt-4">
            {loadingMedia ? (
              <Skeleton className="h-10 w-16 bg-[#213F2C]" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif text-[#F4F1EA]">{pdfCount}</span>
                <span className="text-sm text-[#9AA79F]">PDFs</span>
              </div>
            )}
            <div className="text-xs text-[#9AA79F] mt-1">
              {loadingMedia ? <Skeleton className="h-4 w-24 bg-[#213F2C]" /> : `${imageCount} images`}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden">
            <div className="border-b border-[#1A2E20] p-5 flex justify-between items-center">
              <h2 className="text-lg font-serif text-[#F4F1EA]">Recent Activity</h2>
            </div>

            <div className="p-0">
              {loadingActivity ? (
                <div className="p-5 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full bg-[#213F2C]" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full bg-[#213F2C]" />
                        <Skeleton className="h-3 w-24 bg-[#213F2C]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity?.length === 0 ? (
                <div className="p-8 text-center text-[#9AA79F]">
                  <p>No recent activity found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#1A2E20]">
                  {activity?.slice(0, 8).map(event => (
                    <li key={event.id} className="p-4 hover:bg-[#1A2E20]/50 transition-colors flex items-start gap-4">
                      <div className="bg-[#0B1510] p-2 rounded border border-[#1A2E20] shrink-0 text-[#C8A96B]">
                        {event.entity === "publication" ? <BookOpen className="w-4 h-4" /> :
                         event.entity === "endorsement" ? <Award className="w-4 h-4" /> :
                         event.entity === "media" ? <FileText className="w-4 h-4" /> :
                         event.entity === "theme" ? <Layers className="w-4 h-4" /> :
                         <Settings className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F4F1EA]">
                          <span className="capitalize">{event.action.replace('.', ' ')}</span>
                        </p>
                        <p className="text-xs text-[#9AA79F] mt-1 flex gap-2">
                          <span>{format(new Date(event.createdAt), "MMM d, h:mm a")}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#162B1E] border border-[#1A2E20] rounded-lg overflow-hidden">
            <div className="border-b border-[#1A2E20] p-5">
              <h2 className="text-lg font-serif text-[#F4F1EA]">Quick Links</h2>
            </div>
            <div className="p-3">
              <Link href="/admin/themes" className="flex items-center gap-3 p-3 rounded hover:bg-[#1A2E20] transition-colors text-[#F4F1EA]">
                <Layers className="w-5 h-5 text-[#C8A96B]" />
                <div>
                  <div className="font-medium text-sm">Manage Themes</div>
                  <div className="text-xs text-[#9AA79F]">Organize publications by category</div>
                </div>
              </Link>
              <Link href="/admin/media" className="flex items-center gap-3 p-3 rounded hover:bg-[#1A2E20] transition-colors text-[#F4F1EA]">
                <Library className="w-5 h-5 text-[#C8A96B]" />
                <div>
                  <div className="font-medium text-sm">Media Library</div>
                  <div className="text-xs text-[#9AA79F]">Manage PDFs and images</div>
                </div>
              </Link>
              <Link href="/admin/administrators" className="flex items-center gap-3 p-3 rounded hover:bg-[#1A2E20] transition-colors text-[#F4F1EA]">
                <Users className="w-5 h-5 text-[#C8A96B]" />
                <div>
                  <div className="font-medium text-sm">Administrators</div>
                  <div className="text-xs text-[#9AA79F]">View editorial team access</div>
                </div>
              </Link>
              <Link href="/admin/enquiries" className="flex items-center gap-3 p-3 rounded hover:bg-[#1A2E20] transition-colors text-[#F4F1EA]">
                <Mail className="w-5 h-5 text-[#C8A96B]" /><div><div className="font-medium text-sm">Website Enquiries</div><div className="text-xs text-[#9AA79F]">Review incoming messages</div></div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}