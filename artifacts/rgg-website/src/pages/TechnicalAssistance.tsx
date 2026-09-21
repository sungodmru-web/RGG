import { useState } from "react";
import { useBookContent } from "@/content/bookContent";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function TechnicalAssistance() {
  const { text } = useLanguage();
  const { CORE_PRINCIPLES } = useBookContent();
  const processSteps = [
    text("Assess", "Évaluer"),
    text("Diagnose", "Diagnostiquer"),
    text("Design", "Concevoir"),
    text("Implement", "Mettre en œuvre"),
    text("Evaluate", "Mesurer"),
  ];

  const [submitState, setSubmitState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const handleEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const organization = String(formData.get("organization") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");
    const enquiryType = String(formData.get("enquiryType") ?? "");
    const subject = String(formData.get("subject") ?? "");
    const honeypot = String(formData.get("honeypot") ?? "");
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
        language: text("english", "french") === "english" ? "english" : "french",
        honeypot,
      };
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to send your enquiry.");
      const result = (await response.json()) as { accepted?: boolean };
      if (result.accepted !== true) throw new Error("Unable to send your enquiry.");
      setSubmitState("success");
      form.reset();
      trackEvent("contact_form_submitted", { enquiry_type: enquiryType });
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to send your enquiry.");
    }
  };

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <a
        href="#contact"
        onClick={() =>
          trackEvent("technical_assistance_enquiry_cta_clicked", {
            placement: "floating",
          })
        }
        className="fixed right-4 top-20 z-40 inline-flex min-h-11 items-center border border-[#C8A96B] bg-[#C8A96B] px-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#0B0B0B] shadow-[0_14px_35px_rgba(0,0,0,0.4)] transition-colors hover:bg-[#EDD99A] md:right-6 md:top-24 md:px-5 md:text-[10px]"
      >
        {text("Send Enquiry", "Envoyer une demande")}
        <span aria-hidden="true" className="ml-3">
          ↓
        </span>
      </a>

      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/consultancy-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-40 grayscale"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.96)_0%,rgba(4,8,5,0.85)_40%,rgba(4,8,5,0.65)_70%,rgba(4,8,5,0.8)_100%)]"
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
              {text("Strategic Services", "Services stratégiques")}
            </span>
          </div>

          <h1 className="max-w-4xl font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[0.94] tracking-[-0.045em]">
            {text("Technical", "Assistance")}{" "}
            <span className="italic text-[#EDD99A]">{text("Assistance", "Technique")}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
            {text(
              "Evidence-led thinking and implementation strategy for institutions and governments navigating cannabis governance, public health and sustainable development.",
              "Une réflexion fondée sur des données probantes et une stratégie de mise en œuvre pour les institutions et les gouvernements qui œuvrent dans la gouvernance du cannabis, la santé publique et le développement durable."
            )}
          </p>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.35fr_1fr] lg:gap-16">
            <div>
              <SectionEyebrow>{text("Core Competencies", "Compétences de base")}</SectionEyebrow>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[-0.03em] leading-tight text-[#F4F1EA]">
                {text("Institutional capacity building.", "Renforcement des capacités institutionnelles.")}
              </h2>
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              <div className="border-l border-[#1A2E20] pl-6">
                <h3 className="text-[#C8C5B3] font-serif text-xl mb-3">
                  {text("Governance & Regulation", "Gouvernance et réglementation")}
                </h3>
                <p className="text-[#718078] text-sm font-light leading-relaxed">
                  {text("Framework development, regulatory design, and comparative analysis of international models.", "Développement de cadres, conception réglementaire et analyse comparative de modèles internationaux.")}
                </p>
              </div>
              <div className="border-l border-[#1A2E20] pl-6">
                <h3 className="text-[#C8C5B3] font-serif text-xl mb-3">
                  {text("Health & Evidence", "Santé et données probantes")}
                </h3>
                <p className="text-[#718078] text-sm font-light leading-relaxed">
                  {text("Public health impact assessments, harm reduction strategies, and medical framework design.", "Évaluations de l'impact sur la santé publique, stratégies de réduction des risques et conception de cadres médicaux.")}
                </p>
              </div>
              <div className="border-l border-[#1A2E20] pl-6">
                <h3 className="text-[#C8C5B3] font-serif text-xl mb-3">
                  {text("Economic Development", "Développement économique")}
                </h3>
                <p className="text-[#718078] text-sm font-light leading-relaxed">
                  {text("Value chain analysis, market transition planning, and inclusive economic models.", "Analyse de la chaîne de valeur, planification de la transition du marché et modèles économiques inclusifs.")}
                </p>
              </div>
              <div className="border-l border-[#1A2E20] pl-6">
                <h3 className="text-[#C8C5B3] font-serif text-xl mb-3">
                  {text("Implementation Strategy", "Stratégie de mise en œuvre")}
                </h3>
                <p className="text-[#718078] text-sm font-light leading-relaxed">
                  {text("Transition management, readiness assessment, and institutional alignment.", "Gestion de la transition, évaluation de la préparation et alignement institutionnel.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20] bg-[#07100A]">
        <div className="container mx-auto px-4 py-7 md:px-6 md:py-9">
          <div className="mx-auto max-w-4xl text-center">
            <SectionEyebrow>{text("Institutional Process", "Processus institutionnel")}</SectionEyebrow>
            <h2 className="mb-5 font-serif text-2xl leading-tight tracking-[-0.03em] text-[#F4F1EA] md:text-3xl">
              {text("A structured approach to reform.", "Une approche structurée de la réforme.")}
            </h2>

            <div className="relative grid grid-cols-5 gap-1 md:gap-3">
              <div className="absolute left-[8%] right-[8%] top-4 -z-10 h-px bg-[#1A2E20]"></div>

              {processSteps.map((step, index) => (
                <div key={step} className="flex min-w-0 flex-col items-center bg-[#07100A] px-1">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#C8A96B] bg-[#0B0B0B] font-serif text-sm text-[#C8A96B]">
                    {index + 1}
                  </div>
                  <span className="break-words text-[7px] font-bold uppercase leading-3 tracking-[0.08em] text-[#B8B39F] sm:text-[9px] sm:tracking-[0.14em]">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 border-b border-[#1A2E20] bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionEyebrow>{text("Enquiries", "Demandes de renseignements")}</SectionEyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.03em] leading-tight text-[#F4F1EA] mb-6">
                {text("Initiate a dialogue.", "Engager le dialogue.")}
              </h2>
              <p className="text-[#718078] text-base font-light leading-relaxed mb-8">
                {text("The authors are available for strategic advisory, institutional technical assistance, academic collaboration, and policy dialogue.", "Les auteurs sont disponibles pour du conseil stratégique, de l'assistance technique institutionnelle, des collaborations académiques et du dialogue politique.")}
              </p>

              <div className="space-y-6 text-[#B8B39F] font-light">
                <div className="flex items-start gap-4">
                  <span className="text-[#C8A96B] text-xl leading-none mt-1">✉</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#56685D] mb-1">
                      {text("Email", "E-mail")}
                    </p>
                    <a href="mailto:contact@reclaimingthegreengold.com" className="hover:text-[#C8A96B] transition-colors">contact@reclaimingthegreengold.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#1A2E20] bg-[#07100A] p-8 md:p-12">
              <h3 className="font-serif text-2xl text-[#C8C5B3] mb-8">
                {text("Send an enquiry", "Envoyer une demande")}
              </h3>

              <form
                onSubmit={handleEnquiry}
                className="space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                      {text("Name", "Nom")}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full bg-transparent border-b border-[#405246] py-3 text-sm text-[#F4F1EA] focus:border-[#C8A96B] outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="organization" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                      {text("Organization", "Organisation")}
                    </label>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      className="w-full bg-transparent border-b border-[#405246] py-3 text-sm text-[#F4F1EA] focus:border-[#C8A96B] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="enquiryType" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                    {text("Enquiry Type", "Type de demande")}
                  </label>
                  <select id="enquiryType" name="enquiryType" required defaultValue="" className="w-full bg-transparent border-b border-[#405246] py-3 text-sm text-[#F4F1EA] outline-none">
                    <option value="" disabled>{text("Select a type", "Sélectionnez un type")}</option>
                    <option value="technical_assistance">{text("Technical assistance", "Assistance technique")}</option>
                    <option value="strategic_advisory">{text("Strategic advisory", "Conseil stratégique")}</option>
                    <option value="academic_collaboration">{text("Academic collaboration", "Collaboration académique")}</option>
                    <option value="policy_dialogue">{text("Policy dialogue", "Dialogue politique")}</option>
                    <option value="other">{text("Other", "Autre")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                    {text("Subject", "Objet")}
                  </label>
                  <select id="subject" name="subject" required defaultValue="" className="w-full bg-transparent border-b border-[#405246] py-3 text-sm text-[#F4F1EA] outline-none">
                    <option value="" disabled>{text("Select a subject", "Sélectionnez un objet")}</option>
                    <option value="governance">{text("Cannabis governance", "Gouvernance du cannabis")}</option>
                    <option value="public_health">{text("Public health", "Santé publique")}</option>
                    <option value="sustainable_development">{text("Sustainable development", "Développement durable")}</option>
                    <option value="research">{text("Research and evidence", "Recherche et données probantes")}</option>
                    <option value="other">{text("Other", "Autre")}</option>
                  </select>
                </div>

                <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                  <label htmlFor="honeypot">Leave this field empty</label>
                  <input id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                    {text("Email Address", "Adresse e-mail")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-transparent border-b border-[#405246] py-3 text-sm text-[#F4F1EA] focus:border-[#C8A96B] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                    {text("Message", "Message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full bg-transparent border-b border-[#405246] py-3 text-sm text-[#F4F1EA] focus:border-[#C8A96B] outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitState === "pending"}
                  className="mt-4 inline-flex min-h-12 items-center justify-center border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A] w-full sm:w-auto"
                >
                  {submitState === "pending" ? text("Sending…", "Envoi…") : text("Send", "Envoyer")}
                </button>
                <div aria-live="polite" role={submitState === "error" ? "alert" : undefined} className="text-sm">
                  {submitState === "success" && <p className="text-[#A9D6A8]">{text("Thank you. Your enquiry has been received.", "Merci. Votre demande a bien été reçue.")}</p>}
                  {submitState === "error" && <p className="text-[#D97777]">{errorMessage}</p>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {CORE_PRINCIPLES.length > 0 && (
        <section className="border-b border-[#1A2E20] bg-[#080D09]">
          <div className="container mx-auto px-6 py-14 md:py-20">
            <SectionEyebrow>{text("Core Principles", "Principes fondamentaux")}</SectionEyebrow>
            <div className="mt-8 grid border-l border-t border-[#1A2E20] md:grid-cols-3">
              {CORE_PRINCIPLES.map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="border-b border-r border-[#1A2E20] p-6 md:p-8"
                >
                  <h2 className="font-serif text-2xl tracking-[-0.02em] text-[#C8C5B3]">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm font-light leading-7 text-[#718078]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
