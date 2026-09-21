import type { ReactNode } from "react";
import { useClerk, useSession, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { clearAdminSecurityState } from "@/lib/adminApi";

interface AdminGuardProps {
  children: ReactNode;
}

const SESSION_VERIFICATION_RETRY_DELAYS_MS = [1_000, 2_000];

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function GuardScreen({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#080D09] text-[#F4F1EA]">
      <div className="container mx-auto flex min-h-screen max-w-3xl items-center px-6 py-24">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
            {eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-sm font-light leading-7 text-[#718078]">
            {description}
          </p>
          {children}
        </div>
      </div>
    </main>
  );
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [serverState, setServerState] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  const [verifiedIdentity, setVerifiedIdentity] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const identity = user?.id && session?.id ? `${user.id}:${session.id}` : null;

  useEffect(() => {
    clearAdminSecurityState();
    void queryClient.removeQueries({ queryKey: ["admin"] });
    setVerifiedIdentity(null);
    setServerState("loading");
    if (!isLoaded || !isSignedIn || !identity) return;
    let active = true;
    async function verifySession() {
      try {
        for (
          let attempt = 0;
          attempt <= SESSION_VERIFICATION_RETRY_DELAYS_MS.length;
          attempt++
        ) {
          const response = await fetch("/api/admin/session", {
            cache: "no-store",
            credentials: "include",
          });
          if (!active) return;
          if (response.ok) {
            const body = (await response.json()) as {
              authenticated?: boolean;
              user?: { role?: string };
            };
            const allowed =
              body.authenticated === true && body.user?.role === "admin";
            setVerifiedIdentity(allowed ? identity : null);
            setServerState(allowed ? "allowed" : "denied");
            return;
          }
          const isTemporaryFailure =
            response.status === 429 || response.status >= 500;
          if (
            !isTemporaryFailure ||
            attempt === SESSION_VERIFICATION_RETRY_DELAYS_MS.length
          ) {
            setVerifiedIdentity(null);
            setServerState(isTemporaryFailure ? "error" : "denied");
            return;
          }
          await wait(SESSION_VERIFICATION_RETRY_DELAYS_MS[attempt]);
          if (!active) return;
        }
      } catch {
        if (!active) return;
        setVerifiedIdentity(null);
        setServerState("error");
      }
    }
    void verifySession();
    return () => {
      active = false;
    };
  }, [identity, isLoaded, isSignedIn, queryClient, retryAttempt]);

  if (!isLoaded) {
    return (
      <GuardScreen
        eyebrow="RGG Publishing"
        title="Loading publishing workspace."
        description="Confirming your session and publishing permissions."
      />
    );
  }

  if (!isSignedIn) {
    return (
      <GuardScreen
        eyebrow="Restricted Access"
        title="Sign in to continue."
        description="The RGG publishing workspace is available only to approved administrators."
      >
        <Link
          href="/sign-in"
          className="mt-9 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
        >
          Administrator Sign In →
        </Link>
      </GuardScreen>
    );
  }

  if (
    serverState === "loading" ||
    (serverState === "allowed" && verifiedIdentity !== identity)
  ) {
    return (
      <GuardScreen
        eyebrow="RGG Publishing"
        title="Verifying administrator access."
        description="Confirming your server-side session before opening the publishing workspace."
      />
    );
  }

  if (serverState === "error") {
    return (
      <GuardScreen
        eyebrow="Access Error"
        title="Unable to verify your session."
        description="The publishing service is temporarily unavailable. No protected content has been loaded."
      >
        <button
          type="button"
          onClick={() => setRetryAttempt((attempt) => attempt + 1)}
          className="mt-9 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
        >
          Try Again →
        </button>
      </GuardScreen>
    );
  }

  if (serverState !== "allowed") {
    return (
      <GuardScreen
        eyebrow="Access Denied"
        title="Administrator access required."
        description="The current Clerk session is not authorized. Sign in again with an approved administrator account."
      >
        <button
          type="button"
          onClick={() => void signOut({ redirectUrl: "/sign-in" })}
          className="mt-9 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
        >
          Sign In With Another Account →
        </button>
      </GuardScreen>
    );
  }

  return children;
}