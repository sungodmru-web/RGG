import { useEffect } from "react";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import {
  Switch,
  Route,
  Router as WouterRouter,
  useLocation,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteLayout from "@/components/layout/SiteLayout";
import WelcomeGate from "@/components/welcome/WelcomeGate";
import { BOOK_PUBLICATION } from "@/content/evidenceContent";
import {
  applyPageMetadata,
  metadataForPath,
} from "@/lib/pageMetadata";
import {
  useLanguage,
  type Language,
} from "@/i18n/LanguageContext";

import Home from "@/pages/Home";
import Book from "@/pages/Book";
import Research from "@/pages/Research";
import ResearchArticle from "@/pages/ResearchArticle";
import TechnicalAssistance from "@/pages/TechnicalAssistance";
import Authors from "@/pages/Authors";
import Endorsements from "@/pages/Endorsements";
import Disclaimer from "@/pages/Disclaimer";
import Cookies from "@/pages/Cookies";
import NotFound from "@/pages/not-found";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminHome from "@/pages/admin/AdminHome";
import AdminPublications from "@/pages/admin/AdminPublications";
import AdminPublicationNew from "@/pages/admin/AdminPublicationNew";
import AdminPublicationEdit from "@/pages/admin/AdminPublicationEdit";
import AdminPublicationPreview from "@/pages/admin/AdminPublicationPreview";
import AdminEndorsements from "@/pages/admin/AdminEndorsements";
import AdminEndorsementNew from "@/pages/admin/AdminEndorsementNew";
import AdminEndorsementEdit from "@/pages/admin/AdminEndorsementEdit";
import AdminAdministrators from "@/pages/admin/AdminAdministrators";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminThemes from "@/pages/admin/AdminThemes";
import AdminEnquiries from "@/pages/admin/AdminEnquiries";
import AdminEnquiryDetail from "@/pages/admin/AdminEnquiryDetail";
import PublicationsPage from "@/pages/Publications";

type PageMetadata = {
  title: string;
  description: string;
  type?: "website" | "article";
};

const SITE_NAME = "Reclaiming the Green Gold";
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "#C8A96B",
    colorForeground: "#F4F1EA",
    colorMutedForeground: "#718078",
    colorDanger: "#D97777",
    colorBackground: "#080D09",
    colorInput: "#0B0B0B",
    colorInputForeground: "#F4F1EA",
    colorNeutral: "#405246",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[#080D09] border border-[#1A2E20] w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-[#F4F1EA]",
    headerSubtitle: "text-[#718078]",
    formFieldLabel: "text-[#B8B39F]",
    formFieldInput:
      "bg-[#0B0B0B] border-[#405246] text-[#F4F1EA] rounded-none",
    formButtonPrimary:
      "bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A] rounded-none",
    footerActionLink: "text-[#C8A96B] hover:text-[#EDD99A]",
    footerActionText: "text-[#718078]",
    dividerText: "text-[#718078]",
    dividerLine: "bg-[#1A2E20]",
    socialButtonsBlockButton:
      "border-[#405246] text-[#F4F1EA] rounded-none",
    socialButtonsBlockButtonText: "text-[#F4F1EA]",
  },
};

const ROUTE_METADATA_FR: Record<string, PageMetadata> = {
  "/": {
    title: "Reclaiming the Green Gold | Gouvernance du cannabis",
    description:
      "Découvrez un cadre mondial pour la gouvernance du cannabis, le développement durable, la santé publique, la justice et la transformation économique inclusive.",
  },
  "/book": {
    title: "Le livre | Reclaiming the Green Gold",
    description:
      "Découvrez Reclaiming the Green Gold, un guide stratégique consacré à la gouvernance du cannabis, à la santé publique, à la justice, au développement durable et à la transformation économique.",
  },
  "/publications": {
    title: "Articles et publications | Reclaiming the Green Gold",
    description:
      "Consultez des recherches et analyses stratégiques sur la gouvernance du cannabis, la santé publique, la justice et le développement durable.",
  },
  "/technical-assistance": {
    title: "Assistance technique | Reclaiming the Green Gold",
    description:
      "Découvrez un accompagnement stratégique destiné aux gouvernements et institutions qui travaillent sur la gouvernance du cannabis et le développement durable.",
  },
  "/authors": {
    title: "Les auteurs | Reclaiming the Green Gold",
    description:
      "Découvrez les auteurs de Reclaiming the Green Gold ainsi que les recherches et perspectives qui nourrissent leurs travaux.",
  },
  "/endorsements": {
    title: "Soutiens | Reclaiming the Green Gold",
    description:
      "Commentaires indépendants et revues institutionnelles pour Reclaiming the Green Gold.",
  },
  "/disclaimer": {
    title: "Clause de non-responsabilité | Reclaiming the Green Gold",
    description:
      "Clause de non-responsabilité juridique relative à la publication et à la plateforme de connaissances Reclaiming the Green Gold.",
  },
  "/cookies": {
    title: "Politique relative aux cookies | Reclaiming the Green Gold",
    description:
      "Politique relative aux cookies et pratiques de confidentialité de la plateforme Reclaiming the Green Gold.",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function getPageMetadata(
  location: string,
  language: Language,
): PageMetadata {
  if (language === "en") {
    return metadataForPath(location);
  }

  const pathname = location.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const routeMetadata = ROUTE_METADATA_FR[pathname];

  if (routeMetadata) {
    return routeMetadata;
  }

  if (pathname.startsWith("/publications/")) {
    return {
      title: `Publication | ${SITE_NAME}`,
      description:
        "Consultez cette publication de recherche de Reclaiming the Green Gold sur la gouvernance du cannabis, les politiques publiques, le développement durable et le changement institutionnel.",
      type: "article",
    };
  }

  return {
    title: `Page introuvable | ${SITE_NAME}`,
    description:
      "La page demandée est introuvable. Découvrez les recherches et réflexions stratégiques de Reclaiming the Green Gold sur la gouvernance du cannabis.",
  };
}

function RouteMetadata() {
  const [location] = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const metadata = getPageMetadata(location, language);
    if (metadata) {
      applyPageMetadata(metadata, `${basePath}${location}`);
    }
  }, [language, location]);

  return null;
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location]);

  return null;
}

// Redirect Component
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to, { replace: true });
    const fragment = to.split("#", 2)[1];
    if (fragment) {
      window.setTimeout(() => {
        document.getElementById(fragment)?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }, 0);
    }
  }, [to, setLocation]);

  return null;
}

function PublicRoutes() {
  return (
    <>
      <RouteMetadata />

      <SiteLayout>
        <Switch>
          {/* PRIMARY ROUTES */}
          <Route path="/" component={Home} />
          <Route path="/book" component={Book} />
          <Route path="/publications" component={PublicationsPage} />
          <Route path="/publications/:slug" component={ResearchArticle} />
          <Route path="/technical-assistance" component={TechnicalAssistance} />
          <Route path="/authors" component={Authors} />
          <Route path="/endorsements" component={Endorsements} />

          {/* LEGAL ROUTES */}
          <Route path="/disclaimer" component={Disclaimer} />
          <Route path="/cookies" component={Cookies} />

          {/* LEGACY REDIRECTS */}
          <Route path="/research">
            <Redirect to="/publications" />
          </Route>
          <Route path="/research/:slug">
            {(params) => <Redirect to={`/publications/${params.slug}`} />}
          </Route>
          <Route path="/consultancy">
            <Redirect to="/technical-assistance" />
          </Route>
          <Route path="/framework">
            <Redirect to="/book#framework" />
          </Route>
          <Route path="/formats">
            <Redirect to="/book#formats" />
          </Route>
          <Route path="/policymakers">
            <Redirect to="/technical-assistance" />
          </Route>
          <Route path="/economy">
            <Redirect to="/technical-assistance" />
          </Route>
          <Route path="/partnerships">
            <Redirect to="/technical-assistance" />
          </Route>
          <Route path="/contact">
            <Redirect to="/technical-assistance#contact" />
          </Route>
          <Route path="/about">
            <Redirect to="/authors" />
          </Route>
          <Route path="/media">
            <Redirect to="/publications" />
          </Route>

          <Route component={NotFound} />
        </Switch>
      </SiteLayout>
    </>
  );
}

function AdminRoutes() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={AdminHome} />
          <Route path="/admin/media" component={AdminMedia} />
          <Route path="/admin/themes" component={AdminThemes} />
          <Route path="/admin/administrators" component={AdminAdministrators} />
          <Route path="/admin/enquiries" component={AdminEnquiries} />
          <Route path="/admin/enquiries/:id" component={AdminEnquiryDetail} />

          <Route
            path="/admin/publications"
            component={AdminPublications}
          />

          <Route
            path="/admin/publications/new"
            component={AdminPublicationNew}
          />

          <Route
            path="/admin/publications/:id/preview"
            component={AdminPublicationPreview}
          />

          <Route
            path="/admin/publications/:id"
            component={AdminPublicationEdit}
          />

          <Route
            path="/admin/endorsements"
            component={AdminEndorsements}
          />

          <Route
            path="/admin/endorsements/new"
            component={AdminEndorsementNew}
          />

          <Route
            path="/admin/endorsements/:id"
            component={AdminEndorsementEdit}
          />
        </Switch>
      </AdminLayout>
    </AdminGuard>
  );
}

function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07100A] px-6 py-24">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07100A] px-6 py-24">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </main>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { language, hasChosenLanguage, chooseLanguage } = useLanguage();
  const isPrivateRoute =
    location.startsWith("/admin") ||
    location.startsWith("/sign-in") ||
    location.startsWith("/sign-up");
  const isBookBrowserTest =
    import.meta.env.DEV &&
    location === "/book" &&
    (new URLSearchParams(window.location.search).has("book-visual-test") ||
      new URLSearchParams(window.location.search).has("book-interaction-test") ||
      new URLSearchParams(window.location.search).has("book-editions-test"));

  if (!isPrivateRoute && !hasChosenLanguage && !isBookBrowserTest) {
    return (
      <WelcomeGate
        initialLanguage={language}
        onChooseLanguage={chooseLanguage}
      />
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "RGG Publishing",
            subtitle: "Sign in to manage verified research publications",
          },
        },
        signUp: {
          start: {
            title: "Request publishing access",
            subtitle: "Create an account for administrator approval",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ScrollToTop />
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/admin/*?" component={AdminRoutes} />
            <Route component={PublicRoutes} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
