import { Link } from "wouter";
import { EvidenceNote } from "@/components/content/EvidenceNote";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Economy() {
  const { text } = useLanguage();
  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-40"
        />
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pt-40">
          <div className="max-w-4xl">
             <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Global Cannabis Economy", "Économie mondiale du cannabis")}
              </span>
            </div>
            <h1 className="font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[0.94] tracking-[-0.045em]">
              {text("Market Dynamics &", "Dynamique du marché et")}<br />
              <span className="italic text-[#EDD99A]">{text("Value Chains", "Chaînes de valeur")}</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text(
                "Data, maps, and comparative analysis of cannabis markets, regulatory regimes, value chains, and trade dynamics worldwide.",
                "Données, cartes et analyse comparative des marchés du cannabis, des régimes réglementaires, des chaînes de valeur et de la dynamique commerciale dans le monde."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Market Overview", "Aperçu du marché")}</SectionEyebrow>
          <h2 className="mb-12 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("The Global Cannabis Economy at a Glance", "L'économie mondiale du cannabis en un coup d'œil")}
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { value: "USD 35–40B", label: text("Global legal cannabis market (2024)", "Marché mondial du cannabis légal (2024)") },
              { value: "USD 100B+", label: text("Projected market value by 2030*", "Valeur marchande projetée d'ici 2030*") },
              { value: "~200M", label: text("Past-year cannabis users worldwide", "Personnes ayant consommé du cannabis dans le monde au cours de l'année écoulée") },
              { value: "400,000+", label: text("FTE jobs in North American regulated markets", "Emplois ETP sur les marchés réglementés nord-américains") },
              { value: "~60%", label: text("Medical cannabis share of legal cross-border trade by value", "Part du cannabis médical dans le commerce transfrontalier légal en valeur") },
              { value: "~70%", label: text("North America's share of global legal sales", "Part de l'Amérique du Nord dans les ventes légales mondiales") },
            ].map((stat, i) => (
              <div key={i} className="border border-[#1A2E20] bg-[#07100A] p-8">
                <div className="font-serif text-3xl text-[#C8A96B] md:text-4xl">{stat.value}</div>
                <div className="mt-3 text-sm font-light leading-6 text-[#718078]">{stat.label}</div>
              </div>
            ))}
          </div>
          <EvidenceNote ids={["ECO-001", "ECO-002", "ECO-003"]} noReliance />
          
          <div className="mt-12 border-l-2 border-[#C8A96B] bg-[#07100A] p-8">
            <p className="text-base font-light leading-8 text-[#B8B39F]">
              <strong className="font-medium text-[#F4F1EA]">{text("Cannabis is no longer only a criminal justice issue.", "Le cannabis n'est plus seulement une question de justice pénale.")}</strong> {text("It has become a complex economic and governance frontier spanning medicine, agriculture, retail, industry, and public finance. Outcomes depend less on the formal legal status of cannabis than on the institutional capacity, policy coherence, and adaptive learning systems that states bring to implementation.", "Il est devenu un enjeu complexe à l'intersection de l'économie et de la gouvernance, qui couvre la médecine, l'agriculture, le commerce de détail, l'industrie et les finances publiques. Les résultats dépendent moins du statut juridique formel du cannabis que de la capacité institutionnelle, de la cohérence des politiques et des systèmes d'apprentissage adaptatif que les États mobilisent pour sa mise en œuvre.")}
            </p>
          </div>
          <EvidenceNote ids={["ECO-003", "ECO-004"]} noReliance />
        </div>
      </section>

      {/* Value Chains */}
      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Value Chains & Trade", "Chaînes de valeur et commerce")}</SectionEyebrow>
          <h2 className="mb-12 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("How Value Is Created and Distributed", "Comment la valeur est créée et distribuée")}
          </h2>
          
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="mb-6 font-serif text-2xl text-[#EDD99A]">{text("Value Distribution Across Segments", "Répartition de la valeur par segment")}</h3>
              <p className="mb-8 text-sm font-light leading-7 text-[#718078]">
                {text("Value tends to accumulate as products move", "La valeur a tendance à s'accumuler à mesure que les produits progressent")} <strong className="font-medium text-[#F4F1EA]">{text("downstream", "en aval")}</strong> {text("from primary production toward higher-value functions:", "de la production primaire vers des fonctions à plus forte valeur :")}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-light text-[#B8B39F]">
                  <thead className="border-b border-[#1A2E20] text-[#718078]">
                    <tr>
                      <th className="pb-4 pr-4 font-medium uppercase tracking-wider text-[10px]">{text("Segment", "Segment")}</th>
                      <th className="pb-4 pr-4 font-medium uppercase tracking-wider text-[10px]">{text("Share of Final Value", "Part de la valeur finale")}</th>
                      <th className="pb-4 font-medium uppercase tracking-wider text-[10px]">{text("Entry Barriers", "Barrières à l'entrée")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2E20]">
                    {[
                      { seg: text("Upstream — Cultivation", "En amont — Culture"), share: "10–20%", barriers: text("Low–Moderate", "Faibles–Modérées") },
                      { seg: text("Primary Processing", "Transformation primaire"), share: "5–10%", barriers: text("Moderate", "Modérées") },
                      { seg: text("Extraction & Refining", "Extraction et raffinage"), share: "15–20%", barriers: text("High", "Élevées") },
                      { seg: text("Testing & Certification", "Tests et certification"), share: "5–10%", barriers: text("Very High", "Très élevées") },
                      { seg: text("Formulation", "Formulation"), share: "15–20%", barriers: text("High", "Élevées") },
                      { seg: text("Branding & Marketing", "Image de marque et marketing"), share: "15–20%", barriers: text("High", "Élevées") },
                      { seg: text("Distribution & Retail", "Distribution et commerce de détail"), share: "15–20%", barriers: text("Moderate–High", "Modérées–Élevées") },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-4 pr-4">{row.seg}</td>
                        <td className="py-4 pr-4 text-[#F4F1EA]">{row.share}</td>
                        <td className="py-4">{row.barriers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="mb-6 font-serif text-2xl text-[#EDD99A]">{text("Trade Dynamics", "Dynamique commerciale")}</h3>
              <div className="space-y-6 text-sm font-light leading-7 text-[#718078]">
                <p>
                  {text("Trade flows remain highly concentrated.", "Les flux commerciaux restent très concentrés.")} <strong className="font-medium text-[#F4F1EA]">{text("Medical cannabis", "Le cannabis médical")}</strong> {text("accounts for approximately 60% of legal cross-border trade by value.", "représente environ 60 % du commerce transfrontalier légal en valeur.")} <strong className="font-medium text-[#F4F1EA]">{text("Industrial hemp", "Le chanvre industriel")}</strong> {text("represents approximately 25%, while", "représente environ 25 %, tandis que")} <strong className="font-medium text-[#F4F1EA]">{text("CBD and wellness products", "le CBD et les produits de bien-être")}</strong> {text("account for approximately 15%.", "représentent environ 15 %.")}
                </p>
                <p>
                  <strong className="font-medium text-[#F4F1EA]">{text("Key insight:", "Aperçu clé :")}</strong> {text("Trade routes are not simply transport pathways — they are regulatory pathways. Access depends on documentary compliance, supply-chain integrity, and confidence in origin-country systems as much as on price or quality alone.", "Les routes commerciales ne sont pas de simples voies de transport — ce sont des voies réglementaires. L'accès dépend de la conformité documentaire, de l'intégrité de la chaîne d'approvisionnement et de la confiance dans les systèmes du pays d'origine tout autant que du prix ou de la qualité.")}
                </p>
                <div className="border-l-2 border-[#C8A96B] bg-[#07100A] p-6 mt-6">
                  <p className="text-sm font-light text-[#B8B39F]">
                     <strong className="font-medium text-[#F4F1EA]">{text("For LMIC and SIDS:", "Pour les PRFI et les PEID :")}</strong> {text("Cultivation alone captures only a fraction of final value. Countries that supply raw biomass while lacking the infrastructure to process, brand, or certify risk permanent subordination in global value chains.", "La culture seule ne capte qu'une fraction de la valeur finale. Les pays qui fournissent de la biomasse brute tout en manquant d'infrastructures pour transformer, valoriser la marque ou certifier risquent une subordination permanente dans les chaînes de valeur mondiales.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Economics Table */}
      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Production Economics", "Économie de la production")}</SectionEyebrow>
          <h2 className="mb-12 font-serif text-3xl tracking-[-0.03em] md:text-4xl">
            {text("Estimated Production Costs and Export Prices (USD/gram, 2024)", "Coûts de production et prix d'exportation estimés (USD/gramme, 2024)")}
          </h2>
          <div className="overflow-x-auto border border-[#1A2E20] bg-[#07100A]">
            <table className="w-full text-left text-sm font-light text-[#B8B39F]">
              <thead className="border-b border-[#1A2E20] bg-[#0B0B0B] text-[#718078]">
                <tr>
                  <th className="p-5 font-medium uppercase tracking-wider text-[10px]">{text("Country", "Pays")}</th>
                      <th className="p-5 font-medium uppercase tracking-wider text-[10px]">{text("Ex-Farm Cost", "Coût à la sortie de l'exploitation")}</th>
                  <th className="p-5 font-medium uppercase tracking-wider text-[10px]">{text("Export Price", "Prix d'exportation")}</th>
                  <th className="p-5 font-medium uppercase tracking-wider text-[10px]">{text("GMP Certification", "Certification BPF")}</th>
                  <th className="p-5 font-medium uppercase tracking-wider text-[10px]">{text("Key Export Markets", "Principaux marchés d'exportation")}</th>
                  <th className="p-5 font-medium uppercase tracking-wider text-[10px]">{text("Competitive Position", "Position concurrentielle")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2E20]">
                {[
                  { c: text("Colombia", "Colombie"), cost: "0.05–0.10", price: "0.50–1.50", gmp: text("Growing capacity", "Capacité de croissance"), markets: text("EU, Latin America, Australia", "UE, Amérique latine, Australie"), pos: text("Cost leader; scaling GMP", "Leader en coûts ; mise à l'échelle BPF") },
                  { c: text("Lesotho", "Lesotho"), cost: "0.10–0.20", price: "1.00–2.00", gmp: text("Several facilities", "Plusieurs installations"), markets: text("EU (preferential), UK", "UE (préférentiel), Royaume-Uni"), pos: text("Early mover; limited processing", "Précurseur ; transformation limitée") },
                  { c: text("Portugal", "Portugal"), cost: "0.30–0.50", price: "2.00–4.00", gmp: text("Strong", "Forte"), markets: text("EU (intra-community)", "UE (intracommunautaire)"), pos: text("Regulatory alignment; full service", "Alignement réglementaire ; service complet") },
                  { c: text("Canada", "Canada"), cost: "0.80–1.50", price: "2.50–5.00", gmp: text("Extensive", "Étendue"), markets: text("EU, Israel, Australia, Asia", "UE, Israël, Australie, Asie"), pos: text("Established; higher cost", "Établie ; coût plus élevé") },
                  { c: text("Morocco", "Maroc"), cost: "0.10–0.15", price: text("N/A (emerging)", "ND (marché émergent)"), gmp: text("Developing", "En développement"), markets: text("EU (target)", "UE (cible)"), pos: text("Cost potential; scaling regulatory", "Avantage de coût potentiel ; réglementation en cours de montée en puissance") },
                  { c: text("Jamaica", "Jamaïque"), cost: "0.20–0.40", price: "2.00–4.00", gmp: text("Limited", "Limitée"), markets: text("Limited", "Limitée"), pos: text("Niche/origin; small volume", "Niche/origine ; faible volume") }
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-[#080D09]">
                    <td className="p-5 text-[#F4F1EA] font-medium">{r.c}</td>
                    <td className="p-5">{r.cost}</td>
                    <td className="p-5">{r.price}</td>
                    <td className="p-5">{r.gmp}</td>
                    <td className="p-5">{r.markets}</td>
                    <td className="p-5">{r.pos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <EvidenceNote ids={["ECO-004"]} noReliance />
        </div>
      </section>
      
      {/* Segments */}
      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Market Segments", "Segments de marché")}</SectionEyebrow>
          <h2 className="mb-12 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("Differentiated Cannabis Product Markets", "Marchés des produits du cannabis différenciés")}
          </h2>
          
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 font-serif text-2xl text-[#EDD99A]">{text("Medical Cannabis", "Cannabis médical")}</h3>
              <p className="mb-10 text-sm font-light leading-7 text-[#718078]">
                {text("The largest segment of legal cross-border trade (~60% by value). Governed by pharmaceutical regulations and import licensing. Major importers: Germany, UK, Israel, Australia.", "Le segment le plus important du commerce transfrontalier légal (~60 % en valeur). Régi par les réglementations pharmaceutiques et les licences d'importation. Principaux importateurs : Allemagne, Royaume-Uni, Israël, Australie.")} <strong className="font-medium text-[#B8B39F]">{text("LMIC opportunity:", "Opportunité PRFI :")}</strong> {text("high-margin but compliance-intensive.", "marge élevée mais fortes exigences de conformité.")}
              </p>
              
              <h3 className="mb-4 font-serif text-2xl text-[#EDD99A]">{text("Industrial Hemp", "Chanvre industriel")}</h3>
              <p className="text-sm font-light leading-7 text-[#718078]">
                {text("Applications span textiles, construction materials, automotive composites, food products, and bio-based materials. Global hemp fibre market valued at ~USD 5 billion (2023).", "Les applications couvrent les textiles, les matériaux de construction, les composites automobiles, les produits alimentaires et les matériaux biosourcés. Marché mondial de la fibre de chanvre évalué à environ 5 milliards USD (2023).")} <strong className="font-medium text-[#B8B39F]">{text("LMIC opportunity:", "Opportunité PRFI :")}</strong> {text("broader entry with lower regulatory barriers.", "entrée plus large avec des barrières réglementaires plus faibles.")}
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-serif text-2xl text-[#EDD99A]">{text("CBD & Wellness", "CBD et bien-être")}</h3>
              <p className="mb-10 text-sm font-light leading-7 text-[#718078]">
                {text("Rapidly growing but regulatorily fragmented. CBD isolate prices collapsed from >USD 10,000/kg (2018) to USD 500–1,000 (2024) due to oversupply.", "Croissance rapide mais cadre réglementaire fragmenté. Les prix de l'isolat de CBD se sont effondrés de >10 000 USD/kg (2018) à 500–1 000 USD (2024) en raison d'une offre excédentaire.")} <strong className="font-medium text-[#B8B39F]">{text("LMIC opportunity:", "Opportunité PRFI :")}</strong> {text("brand-sensitive and origin-relevant.", "sensible à la marque et pertinent quant à l'origine.")}
              </p>
              
              <h3 className="mb-4 font-serif text-2xl text-[#EDD99A]">{text("Adult-Use (Domestic)", "Usage adulte (national)")}</h3>
              <p className="text-sm font-light leading-7 text-[#718078]">
                {text("Limited direct cross-border trade; market value driven by domestic consumption. Canada, Uruguay, and several US states operate regulated systems.", "Commerce transfrontalier direct limité ; valeur marchande stimulée par la consommation nationale. Le Canada, l'Uruguay et plusieurs États américains exploitent des systèmes réglementés.")} <strong className="font-medium text-[#B8B39F]">{text("LMIC opportunity:", "Opportunité PRFI :")}</strong> {text("limited direct trade but services potential.", "commerce direct limité mais potentiel dans les services.")}
              </p>
            </div>
          </div>
          <EvidenceNote ids={["ECO-003"]} noReliance />
        </div>
      </section>

      {/* Scenarios */}
      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Forward View", "Perspectives")}</SectionEyebrow>
          <h2 className="mb-12 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("Growth Scenarios for the Cannabis and Hemp Economy", "Scénarios de croissance pour l'économie du cannabis et du chanvre")}
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: text("Conservative Scenario", "Scénario conservateur"), val: text("USD 60–70B by 2030", "60 à 70 milliards USD d'ici 2030"), desc: text("Slow pace of regulatory reform; fragmented standards; limited access to finance; persistent illicit competition in major markets.", "Lenteur des réformes réglementaires ; normes fragmentées ; accès limité au financement ; concurrence illicite persistante sur les principaux marchés.") },
              { title: text("Base Case Scenario", "Scénario de base"), val: text("USD 100–120B by 2030", "100 à 120 milliards USD d'ici 2030"), desc: text("Continued incremental reform; expanding medical access in Europe and Latin America; gradual industrial hemp scale-up.", "Poursuite des réformes progressives ; élargissement de l'accès médical en Europe et en Amérique latine ; montée en puissance graduelle du chanvre industriel.") },
              { title: text("Accelerated Scenario", "Scénario accéléré"), val: text("USD 150B+ by 2030", "+ de 150 milliards USD d'ici 2030"), desc: text("Broad regulatory liberalisation; harmonised international standards; significant investment in processing and innovation; rapid formalisation in LMIC.", "Vaste libéralisation réglementaire ; normes internationales harmonisées ; investissements importants dans la transformation et l'innovation ; formalisation rapide dans les PRFI.") }
            ].map((sc, i) => (
              <div key={i} className="border border-[#1A2E20] bg-[#07100A] p-8">
                <h4 className="mb-4 font-serif text-xl text-[#F4F1EA]">{sc.title}</h4>
                <div className="mb-4 font-serif text-2xl text-[#C8A96B]">{sc.val}*</div>
                <p className="text-sm font-light leading-7 text-[#718078]">{sc.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs font-light text-[#56685D]">
            {text("* Projections are illustrative scenarios based on market modeling, not guarantees of future performance.", "* Les projections sont des scénarios illustratifs basés sur la modélisation du marché, et non des garanties de résultats futurs.")}
          </p>
          <EvidenceNote ids={["ECO-001"]} noReliance />
        </div>
      </section>

      {/* Development Implications */}
      <section className="bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Development Implications", "Implications pour le développement")}</SectionEyebrow>
          <h2 className="mb-12 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("What This Means for LMIC and SIDS", "Ce que cela signifie pour les PRFI et les PEID")}
          </h2>
          
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="mb-6 font-serif text-2xl text-[#EDD99A]">{text("Strategic Imperatives", "Impératifs stratégiques")}</h3>
              <ul className="space-y-4 text-sm font-light leading-7 text-[#718078] list-disc pl-5">
                <li><strong className="font-medium text-[#B8B39F]">{text("Move beyond cultivation:", "Aller au-delà de la culture :")}</strong> {text("invest in processing, extraction, formulation, and quality assurance.", "investir dans la transformation, l'extraction, la formulation et l'assurance qualité.")}</li>
                <li><strong className="font-medium text-[#B8B39F]">{text("Leverage regional cooperation:", "Tirer parti de la coopération régionale :")}</strong> {text("shared laboratories, harmonised standards, and mutual recognition reduce compliance costs.", "les laboratoires partagés, les normes harmonisées et la reconnaissance mutuelle réduisent les coûts de conformité.")}</li>
                <li><strong className="font-medium text-[#B8B39F]">{text("Prioritise inclusion:", "Donner la priorité à l'inclusion :")}</strong> {text("tiered licensing, cooperative models, and technical assistance ensure smallholders are not excluded.", "les licences à plusieurs niveaux, les modèles coopératifs et l'assistance technique garantissent que les petits exploitants ne sont pas exclus.")}</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-6 font-serif text-2xl text-[#EDD99A]">{text("Risk Factors", "Facteurs de risque")}</h3>
              <ul className="space-y-4 text-sm font-light leading-7 text-[#718078] list-disc pl-5">
                <li><strong className="font-medium text-[#B8B39F]">{text("Raw material trap:", "Le piège de la matière première :")}</strong> {text("without beneficiation, producer countries risk supplying biomass while higher-value functions remain externalised.", "sans valorisation, les pays producteurs risquent de fournir de la biomasse tandis que les fonctions à plus forte valeur restent externalisées.")}</li>
                <li><strong className="font-medium text-[#B8B39F]">{text("Market concentration:", "Concentration du marché :")}</strong> {text("capital-intensive compliance favours well-resourced firms.", "la conformité à forte intensité de capital favorise les entreprises bien dotées.")}</li>
                <li><strong className="font-medium text-[#B8B39F]">{text("Illicit persistence:", "Persistance illicite :")}</strong> {text("where legal prices remain high and access limited, informal markets retain competitive advantage.", "là où les prix légaux restent élevés et l'accès limité, les marchés informels conservent un avantage concurrentiel.")}</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 border-l-2 border-[#C8A96B] bg-[#07100A] p-8">
            <p className="text-base font-light leading-8 text-[#B8B39F]">
              <strong className="font-medium text-[#F4F1EA]">{text("The central strategic question for LMIC and SIDS is not whether cannabis offers opportunity in the abstract, but whether participation occurs on terms that support domestic value creation, productive learning, and inclusive development.", "La question stratégique centrale pour les PRFI et les PEID n'est pas de savoir si le cannabis offre une opportunité dans l'absolu, mais si la participation s'effectue à des conditions qui soutiennent la création de valeur nationale, l'apprentissage productif et le développement inclusif.")}</strong> {text("Market outcomes are governed outcomes, reflecting underlying asymmetries in regulatory capacity, financial access, and knowledge control.", "Les résultats du marché sont façonnés par les choix de gouvernance et reflètent les asymétries sous-jacentes dans la capacité réglementaire, l'accès au financement et le contrôle des connaissances.")}
            </p>
          </div>
          
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <h2 className="mb-6 font-serif text-3xl tracking-[-0.02em] text-[#F4F1EA]">{text("Explore the Full Analysis", "Explorer l'analyse complète")}</h2>
            <p className="mb-10 max-w-xl text-sm font-light leading-7 text-[#718078]">
              {text("The expanded Global Cannabis Economy analysis is planned for", "L'analyse élargie de l'économie mondiale du cannabis est prévue pour")} <span className="italic text-[#B8B39F]">Reclaiming the Green Gold</span>{text(", subject to final source and editorial review.", ", sous réserve de l'examen final des sources et de l'examen éditorial.")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/formats"
                className="inline-flex min-h-12 items-center justify-center border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
              >
                {text("View Publication Status", "Voir le statut de publication")}
              </Link>
              <Link
                href="/framework"
                className="inline-flex min-h-12 items-center justify-center border border-[#405246] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
              >
                {text("View Frameworks", "Voir les cadres")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
