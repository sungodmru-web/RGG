import { useEffect, useState } from "react";
import { EvidenceNote } from "@/components/content/EvidenceNote";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Authors() {
  const { text } = useLanguage();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!enquiryOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEnquiryOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [enquiryOpen]);

  const handleEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const organization = String(formData.get("organization") ?? "");
    const email = String(formData.get("email") ?? "");
    const purpose = String(formData.get("purpose") ?? "");
    const message = String(formData.get("message") ?? "");
    const honeypot = String(formData.get("honeypot") ?? "");
    const subject = text(
      `Author enquiry: ${purpose}`,
      `Demande aux auteurs : ${purpose}`,
    );
    const enquiryType =
      purpose === "Strategic advisory" || purpose === "Conseil stratégique"
        ? "strategic_advisory"
        : purpose === "Academic collaboration" || purpose === "Collaboration académique"
          ? "academic_collaboration"
          : "other";
    const language = text("english", "french") === "english" ? "english" : "french";

    setSubmitState("pending");
    setErrorMessage("");
    try {
      const payload = {
        name,
        email,
        organization: organization || null,
        enquiryType,
        subject,
        message,
        language,
        honeypot,
      };
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(text("Unable to send your enquiry.", "Impossible d’envoyer votre demande."));
      const result = (await response.json()) as { accepted?: boolean };
      if (result.accepted !== true) throw new Error(text("Unable to send your enquiry.", "Impossible d’envoyer votre demande."));
      form.reset();
      setSubmitState("success");
      trackEvent("author_enquiry_submitted", { purpose });
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : text("Unable to send your enquiry.", "Impossible d’envoyer votre demande."));
    }
  };

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/authors-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full rotate-180 scale-[1.02] object-cover object-center opacity-65"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.97)_0%,rgba(4,8,5,0.88)_40%,rgba(4,8,5,0.52)_70%,rgba(4,8,5,0.4)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050805]/70 via-transparent to-[#050805]/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-25"
        />

        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pt-40 lg:pb-28">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("About the Platform", "À propos de la plateforme")}
            </span>
          </div>

          <h1 className="max-w-4xl break-words font-serif text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.94] tracking-[-0.045em] sm:text-[clamp(3.5rem,7vw,6.5rem)]">
            {text("Governance, development and ", "Gouvernance, développement et ")}<span className="italic text-[#EDD99A]">{text("medical perspectives.", "perspectives médicales.")}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
            {text(
              "Reclaiming the Green Gold is an independent knowledge platform exploring cannabis reform. Meet the authors and explore the perspectives behind the work.",
              "Reclaiming the Green Gold est une plateforme de connaissances indépendante explorant la réforme du cannabis. Rencontrez les auteurs et explorez les perspectives derrière cet ouvrage."
            )}
          </p>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

            <article className="overflow-hidden border border-[#1A2E20] bg-[#07100A]">
              <div className="aspect-[5/6] overflow-hidden border-b border-[#1A2E20] bg-[#F4F1EA]">
                <img
                  src={`${import.meta.env.BASE_URL}images/authors/soobaschand-sweenarain.jpeg`}
                  alt={text(
                    "Portrait of Dr Soobaschand Sweenarain",
                    "Portrait du Dr Soobaschand Sweenarain",
                  )}
                  width={1145}
                  height={1374}
                  loading="eager"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="p-8 md:p-12">
                <h2 className="font-serif text-3xl tracking-[-0.02em] text-[#F4F1EA]">
                  Dr Soobaschand (Sunil) Sweenarain
                </h2>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A98C50]">
                  {text("Lead Author", "Auteur principal")}
                </p>
                <p className="mt-6 text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                  {text("Natural Resource Economist with more than three decades of international experience in sustainable development, governance, institutional reform and policy advisory.", "Économiste des ressources naturelles avec plus de trois décennies d'expérience internationale dans le développement durable, la gouvernance, la réforme institutionnelle et le conseil politique.")}
                </p>
                <EvidenceNote ids={["BIO-001"]} title={text("Biography provenance", "Provenance de la biographie")} />
              </div>
            </article>

            <article className="overflow-hidden border border-[#1A2E20] bg-[#07100A]">
              <div className="aspect-[5/6] overflow-hidden border-b border-[#1A2E20] bg-[#F4F1EA]">
                <img
                  src={`${import.meta.env.BASE_URL}images/authors/sunny-sweenarain.jpeg`}
                  alt={text(
                    "Portrait of Sunny Sweenarain",
                    "Portrait de Sunny Sweenarain",
                  )}
                  width={1145}
                  height={1374}
                  loading="lazy"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="p-8 md:p-12">
                <h2 className="font-serif text-3xl tracking-[-0.02em] text-[#F4F1EA]">
                  Sunny Sweenarain
                </h2>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A98C50]">
                  {text("Co-Author", "Co-auteur")}
                </p>
                <p className="mt-6 text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                  {text("Medical cannabis specialist focused on patient-centred applications, clinical interpretation, ethical practice and responsible regulatory frameworks.", "Spécialiste du cannabis médical spécialisé dans les applications centrées sur le patient, l'interprétation clinique, la pratique éthique et les cadres réglementaires responsables.")}
                </p>
                <EvidenceNote ids={["BIO-002"]} title={text("Biography provenance", "Provenance de la biographie")} />
              </div>
            </article>

          </div>
        </div>
      </section>

      <section className="bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 text-center md:py-32">
          <SectionEyebrow>{text("A Unique Collaboration", "Une collaboration unique")}</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-4xl font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.1] tracking-[-0.03em] text-[#C8C5B3]">
            {text("Combining macro-level governance analysis with ", "Combinant une analyse de la gouvernance au niveau macro avec ")}<span className="italic text-[#EDD99A]">{text("medical and ethical insight.", "des perspectives médicales et éthiques.")}</span>
          </h2>
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setEnquiryOpen(true);
                trackEvent("author_enquiry_dialog_opened", {});
              }}
              className="inline-flex min-h-12 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
            >
              {text("Contact the Authors", "Contacter les auteurs")} <span aria-hidden="true" className="ml-4">→</span>
            </button>
          </div>
        </div>
      </section>

      {enquiryOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm md:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEnquiryOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="author-enquiry-title"
            className="relative my-auto w-full max-w-2xl border border-[#2B4534] bg-[#07100A] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.65)] md:p-10"
          >
            <button
              type="button"
              onClick={() => setEnquiryOpen(false)}
              aria-label={text("Close enquiry form", "Fermer le formulaire de demande")}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-[#405246] text-xl text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
            >
              ×
            </button>

            <SectionEyebrow>{text("Contact the Authors", "Contacter les auteurs")}</SectionEyebrow>
            <h2
              id="author-enquiry-title"
              className="max-w-lg pr-12 font-serif text-3xl leading-tight tracking-[-0.03em] text-[#F4F1EA] md:text-4xl"
            >
              {text("How can we help?", "Comment pouvons-nous vous aider ?")}
            </h2>

            <form onSubmit={handleEnquiry} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="author-name" className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078]">
                    {text("Name", "Nom")}
                  </label>
                  <input
                    id="author-name"
                    name="name"
                    type="text"
                    required
                    autoFocus
                    className="mt-2 w-full border-b border-[#405246] bg-transparent py-3 text-sm text-[#F4F1EA] outline-none transition-colors focus:border-[#C8A96B]"
                  />
                </div>
                <div>
                  <label htmlFor="author-email" className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078]">
                    {text("Email", "E-mail")}
                  </label>
                  <input
                    id="author-email"
                    name="email"
                    type="email"
                    required
                    className="mt-2 w-full border-b border-[#405246] bg-transparent py-3 text-sm text-[#F4F1EA] outline-none transition-colors focus:border-[#C8A96B]"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="author-organization" className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078]">
                    {text("Organization", "Organisation")}
                  </label>
                  <input
                    id="author-organization"
                    name="organization"
                    type="text"
                    className="mt-2 w-full border-b border-[#405246] bg-transparent py-3 text-sm text-[#F4F1EA] outline-none transition-colors focus:border-[#C8A96B]"
                  />
                </div>
                <div>
                  <label htmlFor="author-purpose" className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078]">
                    {text("Enquiry Type", "Type de demande")}
                  </label>
                  <select
                    id="author-purpose"
                    name="purpose"
                    required
                    defaultValue=""
                    className="mt-2 w-full border-b border-[#405246] bg-[#07100A] py-3 text-sm text-[#F4F1EA] outline-none transition-colors focus:border-[#C8A96B]"
                  >
                    <option value="" disabled>{text("Select an option", "Choisir une option")}</option>
                    <option value={text("Bulk book buying", "Achat de livres en gros")}>{text("Bulk book buying", "Achat de livres en gros")}</option>
                    <option value={text("Strategic advisory", "Conseil stratégique")}>{text("Strategic advisory", "Conseil stratégique")}</option>
                    <option value={text("Speaking or media", "Conférence ou média")}>{text("Speaking or media", "Conférence ou média")}</option>
                    <option value={text("Academic collaboration", "Collaboration académique")}>{text("Academic collaboration", "Collaboration académique")}</option>
                    <option value={text("Other enquiry", "Autre demande")}>{text("Other enquiry", "Autre demande")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="author-message" className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078]">
                  {text("Message", "Message")}
                </label>
                <textarea
                  id="author-message"
                  name="message"
                  rows={4}
                  required
                  className="mt-2 w-full resize-y border border-[#405246] bg-transparent p-3 text-sm leading-6 text-[#F4F1EA] outline-none transition-colors focus:border-[#C8A96B]"
                />
              </div>

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="author-company-website">Company website</label>
                <input
                  id="author-company-website"
                  name="honeypot"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {submitState === "success" && (
                <p role="status" className="border border-[#2E4738] bg-[#0B1A10] p-4 text-sm text-[#A9D6A8]">
                  {text(
                    "Your enquiry has been received. The authors’ team will respond as soon as possible.",
                    "Votre demande a bien été reçue. L’équipe des auteurs vous répondra dès que possible.",
                  )}
                </p>
              )}
              {submitState === "error" && (
                <p role="alert" className="border border-[#6B3333] bg-[#1A0B0B] p-4 text-sm text-[#E7A6A6]">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitState === "pending"}
                className="inline-flex min-h-12 w-full items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
              >
                {submitState === "pending"
                  ? text("Sending…", "Envoi…")
                  : text("Send Enquiry", "Envoyer la demande")}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
