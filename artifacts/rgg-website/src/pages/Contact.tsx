import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Contact() {
  const { text } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organisation: "",
    enquiry: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.enquiry || !formData.message) {
      alert(text("Please fill in all required fields.", "Veuillez remplir tous les champs obligatoires."));
      return;
    }

    trackEvent("contact_form_submitted", { enquiry_type: formData.enquiry });

    const subject = encodeURIComponent(`${text("Enquiry:", "Demande :")} ${formData.enquiry} — ${text("from", "de")} ${formData.name}`);
    const body = encodeURIComponent(
      `${text("Name:", "Nom :")} ${formData.name}\n` +
      `${text("Email:", "E-mail :")} ${formData.email}\n` +
      `${text("Organisation:", "Organisation :")} ${formData.organisation || text("Not provided", "Non fournie")}\n` +
      `${text("Enquiry Type:", "Type de demande :")} ${formData.enquiry}\n\n` +
      `${text("Message:\n", "Message :\n")}${formData.message}`
    );

    window.location.href = `mailto:contact@reclaimingthegreengold.com?subject=${subject}&body=${body}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/contact-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-65"
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
              {text("Contact & Dialogue", "Contact et dialogue")}
            </span>
          </div>

          <h1 className="max-w-4xl font-serif text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.94] tracking-[-0.045em]">
            {text("Start a conversation that moves from ", "Initiez une conversation pour passer de la ")}<span className="italic text-[#EDD99A]">{text("reform to readiness.", "réforme à la préparation.")}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
            {text("Engage with the handbook, explore policy dialogue, technical assistance, institutional collaboration, or media requests.", "Découvrez le manuel, explorez le dialogue politique, l'assistance technique, la collaboration institutionnelle ou les demandes des médias.")}
          </p>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <SectionEyebrow>{text("Get in Touch", "Nous contacter")}</SectionEyebrow>
              <h2 className="mt-6 font-serif text-3xl tracking-[-0.02em] md:text-4xl">
                {text("Enquiry Types Welcome", "Types de demandes")}
              </h2>
              
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="border border-[#1A2E20] bg-[#07100A] p-6">
                  <h3 className="font-serif text-xl text-[#C8C5B3]">{text("Policy Dialogue", "Dialogue politique")}</h3>
                  <p className="mt-3 text-sm font-light leading-6 text-[#718078]">
                    {text("For governments exploring cannabis reform pathways and governance frameworks.", "Pour les gouvernements explorant les voies de réforme du cannabis et les cadres de gouvernance.")}
                  </p>
                </div>
                <div className="border border-[#1A2E20] bg-[#07100A] p-6">
                  <h3 className="font-serif text-xl text-[#C8C5B3]">{text("Institutional Access", "Accès institutionnel")}</h3>
                  <p className="mt-3 text-sm font-light leading-6 text-[#718078]">
                    {text("For organisations registering interest in proposed future formats or discussing access requirements. No purchase or licence is currently offered.", "Pour les organisations manifestant leur intérêt pour de futurs formats proposés ou discutant des exigences d'accès. Aucun achat ni licence n'est actuellement proposé.")}
                  </p>
                </div>
                <div className="border border-[#1A2E20] bg-[#07100A] p-6">
                  <h3 className="font-serif text-xl text-[#C8C5B3]">{text("Partnerships", "Partenariats")}</h3>
                  <p className="mt-3 text-sm font-light leading-6 text-[#718078]">
                    {text("For collaboration and capacity-building initiatives.", "Pour des initiatives de collaboration et de renforcement des capacités.")}
                  </p>
                </div>
                <div className="border border-[#1A2E20] bg-[#07100A] p-6">
                  <h3 className="font-serif text-xl text-[#C8C5B3]">{text("Media & Speaking", "Médias et interventions")}</h3>
                  <p className="mt-3 text-sm font-light leading-6 text-[#718078]">
                    {text("For interviews, publications and conferences.", "Pour des entretiens, des publications et des conférences.")}
                  </p>
                </div>
              </div>

              <div className="mt-12 border-t border-[#1A2E20] pt-10">
                <p className="text-sm font-light leading-7 text-[#B8B39F]">
                  <strong>{text("Direct Email:", "E-mail direct :")}</strong> <a href="mailto:contact@reclaimingthegreengold.com" className="text-[#C8A96B] transition-colors hover:text-[#EDD99A]">contact@reclaimingthegreengold.com</a>
                </p>
              </div>
            </div>

            <div>
              <div className="border border-[#1A2E20] bg-[#07100A] p-8 md:p-10">
                <SectionEyebrow>{text("Send a Message", "Envoyer un message")}</SectionEyebrow>
                <p className="mb-8 text-sm font-light leading-6 text-[#718078]">
                  {text("Complete the form below. On submission, your email client will open with the message pre-filled — ready to send.", "Remplissez le formulaire ci-dessous. Lors de la soumission, votre client de messagerie s'ouvrira avec le message pré-rempli — prêt à être envoyé.")}
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#B8B39F]">
                        {text("Full Name *", "Nom complet *")}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-none border border-[#1A2E20] bg-[#0B0B0B] px-4 py-3 text-sm font-light text-[#F4F1EA] transition-colors focus:border-[#C8A96B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#B8B39F]">
                        {text("Email Address *", "Adresse e-mail *")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-none border border-[#1A2E20] bg-[#0B0B0B] px-4 py-3 text-sm font-light text-[#F4F1EA] transition-colors focus:border-[#C8A96B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="organisation" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#B8B39F]">
                      {text("Organisation / Institution", "Organisation / Institution")}
                    </label>
                    <input
                      type="text"
                      id="organisation"
                      name="organisation"
                      value={formData.organisation}
                      onChange={handleInputChange}
                      className="w-full rounded-none border border-[#1A2E20] bg-[#0B0B0B] px-4 py-3 text-sm font-light text-[#F4F1EA] transition-colors focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiry" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#B8B39F]">
                      {text("Enquiry Type *", "Type de demande *")}
                    </label>
                    <div className="relative">
                      <select
                        id="enquiry"
                        name="enquiry"
                        required
                        value={formData.enquiry}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-none border border-[#1A2E20] bg-[#0B0B0B] px-4 py-3 text-sm font-light text-[#F4F1EA] transition-colors focus:border-[#C8A96B] focus:outline-none"
                      >
                        <option value="">{text("Please select...", "Veuillez sélectionner...")}</option>
                        <option value={text("Policy Dialogue / Technical Assistance", "Dialogue politique / Assistance technique")}>{text("Policy Dialogue / Technical Assistance", "Dialogue politique / Assistance technique")}</option>
                        <option value={text("Institutional / Regional Partnership", "Partenariat institutionnel / régional")}>{text("Institutional / Regional Partnership", "Partenariat institutionnel / régional")}</option>
                        <option value={text("Media / Press Request", "Demande des médias / presse")}>{text("Media / Press Request", "Demande des médias / presse")}</option>
                        <option value={text("Bulk / Institutional Book Order", "Commande en gros ou institutionnelle de livres")}>{text("Bulk / Institutional Book Order", "Commande en gros ou institutionnelle de livres")}</option>
                        <option value={text("Speaking / Conference Invitation", "Invitation à intervenir / à une conférence")}>{text("Speaking / Conference Invitation", "Invitation à intervenir / à une conférence")}</option>
                        <option value={text("Research Collaboration", "Collaboration de recherche")}>{text("Research Collaboration", "Collaboration de recherche")}</option>
                        <option value={text("Other", "Autre")}>{text("Other", "Autre")}</option>
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#718078]">
                        ▼
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#B8B39F]">
                      {text("Message *", "Message *")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full resize-y rounded-none border border-[#1A2E20] bg-[#0B0B0B] px-4 py-3 text-sm font-light text-[#F4F1EA] transition-colors focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full border border-[#C8A96B] bg-[#C8A96B] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
                  >
                    {text("Open in Email Client →", "Ouvrir dans le client de messagerie →")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
